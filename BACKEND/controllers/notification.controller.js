const { prisma } = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler.middleware');
const { verifyUnsubscribeToken } = require('../utils/unsubscribeToken');
const { isEmailConfigured } = require('../services/email.service');
const notifications = require('../services/notifications.service');

function parsePagination(query, defaultLimit = 20) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

function paginatedResponse(data, total, page, limit) {
  return {
    success: true,
    count: data.length,
    total,
    page,
    pages: Math.ceil(total / limit) || 1,
    data,
  };
}

const unsubscribePage = (message, success) => `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Unsubscribe</title></head>
<body style="font-family: system-ui, sans-serif; max-width: 480px; margin: 48px auto; padding: 0 24px; text-align: center;">
  <h1 style="font-size: 1.25rem;">${success ? 'Unsubscribed' : 'Unable to unsubscribe'}</h1>
  <p style="color: #444;">${message}</p>
</body>
</html>`;

const unsubscribe = asyncHandler(async (req, res) => {
  const list = req.query.list || req.body?.list;
  const email = (req.query.email || req.body?.email || '').trim().toLowerCase();
  const token = req.query.token || req.body?.token;

  if (!verifyUnsubscribeToken(list, email, token)) {
    if (req.method === 'GET') {
      return res.status(400).send(unsubscribePage('This unsubscribe link is invalid or has expired.', false));
    }
    return res.status(400).json({ success: false, error: 'Invalid unsubscribe link' });
  }

  if (list === 'newsletter') {
    const updated = await prisma.newsletterSubscriber.updateMany({
      where: { email },
      data: { status: 'unsubscribed', unsubscribedAt: new Date() },
    });
    if (updated.count === 0) {
      const msg = 'No subscription found for this email address.';
      if (req.method === 'GET') return res.status(404).send(unsubscribePage(msg, false));
      return res.status(404).json({ success: false, error: msg });
    }
  } else if (list === 'tender-alerts') {
    const updated = await prisma.tenderAlertSubscription.updateMany({
      where: { email },
      data: { isActive: false, unsubscribedAt: new Date() },
    });
    if (updated.count === 0) {
      const msg = 'No tender alert subscription found for this email address.';
      if (req.method === 'GET') return res.status(404).send(unsubscribePage(msg, false));
      return res.status(404).json({ success: false, error: msg });
    }
  } else {
    if (req.method === 'GET') {
      return res.status(400).send(unsubscribePage('Unknown subscription list.', false));
    }
    return res.status(400).json({ success: false, error: 'Unknown subscription list' });
  }

  if (req.method === 'GET') {
    return res.send(unsubscribePage('You have been unsubscribed successfully.', true));
  }

  res.status(200).json({ success: true, message: 'Unsubscribed successfully' });
});

const getEmailStatus = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      configured: isEmailConfigured(),
      from: isEmailConfigured() ? process.env.SMTP_FROM || process.env.SMTP_USER : null,
    },
  });
});

const listTenderAlertSubscribers = asyncHandler(async (req, res) => {
  const { active } = req.query;
  const { page, limit, skip } = parsePagination(req.query);
  const where = {};

  if (active === 'true') where.isActive = true;
  else if (active === 'false') where.isActive = false;

  const [items, total] = await Promise.all([
    prisma.tenderAlertSubscription.findMany({
      where,
      skip,
      take: limit,
      orderBy: { subscribedAt: 'desc' },
    }),
    prisma.tenderAlertSubscription.count({ where }),
  ]);

  res.status(200).json(paginatedResponse(items, total, page, limit));
});

const sendNewsletter = asyncHandler(async (req, res) => {
  const { subject, body } = req.body;
  const result = await notifications.sendNewsletterBroadcast({
    subject,
    body,
    sentById: req.user.id,
  });

  res.status(200).json({
    success: true,
    message: `Newsletter sent to ${result.sent} subscriber(s)`,
    data: result,
  });
});

const sendTestEmail = asyncHandler(async (req, res) => {
  const { to } = req.body;
  const result = await notifications.sendTestEmail(to, req.user.id);

  res.status(200).json({
    success: true,
    message: 'Test email sent',
    data: result,
  });
});

const listEmailNotifications = asyncHandler(async (req, res) => {
  const { type, status, recipient, campaignId } = req.query;
  const { page, limit, skip } = parsePagination(req.query);
  const where = {};

  if (type) where.type = type;
  if (status) where.status = status;
  if (recipient) where.recipient = recipient.trim().toLowerCase();
  if (campaignId) where.campaignId = campaignId;

  const [items, total] = await Promise.all([
    prisma.emailNotification.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        campaign: { select: { id: true, subject: true } },
        sentBy: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.emailNotification.count({ where }),
  ]);

  res.status(200).json(paginatedResponse(items, total, page, limit));
});

const listNewsletterCampaigns = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const { page, limit, skip } = parsePagination(req.query);
  const where = status ? { status } : {};

  const [items, total] = await Promise.all([
    prisma.newsletterCampaign.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        sentBy: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.newsletterCampaign.count({ where }),
  ]);

  res.status(200).json(paginatedResponse(items, total, page, limit));
});

module.exports = {
  unsubscribe,
  getEmailStatus,
  listTenderAlertSubscribers,
  sendNewsletter,
  sendTestEmail,
  listEmailNotifications,
  listNewsletterCampaigns,
};
