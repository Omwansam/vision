const { prisma } = require('../config/db');
const config = require('../config/env');
const { sendEmail, dispatchEmail } = require('./email.service');
const templates = require('./email.templates');

async function getAdminEmail() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: 'site' },
    select: { email: true },
  });
  return settings?.email || config.ADMIN_NOTIFICATION_EMAIL || config.SMTP_FROM || config.SMTP_USER;
}

async function getTendersEmail() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: 'site' },
    select: { tendersEmail: true, email: true },
  });
  return settings?.tendersEmail || settings?.email || config.ADMIN_NOTIFICATION_EMAIL || config.SMTP_FROM;
}

async function deliverEmail({
  type,
  recipient,
  template,
  relations = {},
  sentById = null,
  metadata = null,
}) {
  const normalizedRecipient = recipient.trim().toLowerCase();

  const notification = await prisma.emailNotification.create({
    data: {
      type,
      recipient: normalizedRecipient,
      subject: template.subject,
      status: 'pending',
      metadata,
      sentById,
      ...relations,
    },
  });

  try {
    const result = await sendEmail({
      to: normalizedRecipient,
      subject: template.subject,
      html: template.html,
    });
    const status = result.skipped ? 'skipped' : 'sent';

    await prisma.emailNotification.update({
      where: { id: notification.id },
      data: {
        status,
        messageId: result.messageId,
        sentAt: status === 'sent' ? new Date() : null,
      },
    });

    return { ...result, notificationId: notification.id, status };
  } catch (err) {
    await prisma.emailNotification.update({
      where: { id: notification.id },
      data: { status: 'failed', errorMessage: err.message },
    });
    throw err;
  }
}

async function newsletterSubscriberId(email) {
  const subscriber = await prisma.newsletterSubscriber.findUnique({
    where: { email: email.trim().toLowerCase() },
    select: { id: true },
  });
  return subscriber?.id ?? null;
}

async function tenderAlertSubscriptionId(email) {
  const subscription = await prisma.tenderAlertSubscription.findUnique({
    where: { email: email.trim().toLowerCase() },
    select: { id: true },
  });
  return subscription?.id ?? null;
}

function notifyNewsletterWelcome(email) {
  dispatchEmail(async () => {
    const subscriberId = await newsletterSubscriberId(email);
    await deliverEmail({
      type: 'newsletter_welcome',
      recipient: email,
      template: templates.newsletterWelcome(email),
      relations: subscriberId ? { newsletterSubscriberId: subscriberId } : {},
    });
  });
}

function notifyTenderAlertWelcome(subscription) {
  dispatchEmail(async () => {
    await deliverEmail({
      type: 'tender_alert_welcome',
      recipient: subscription.email,
      template: templates.tenderAlertWelcome(subscription.email),
      relations: { tenderAlertSubscriptionId: subscription.id },
    });
  });
}

function notifyContactSubmission(submission) {
  dispatchEmail(async () => {
    await deliverEmail({
      type: 'contact_confirmation',
      recipient: submission.email,
      template: templates.contactConfirmation(submission),
      metadata: { referenceCode: submission.referenceCode },
    });

    const adminEmail = await getAdminEmail();
    if (adminEmail) {
      await deliverEmail({
        type: 'contact_admin',
        recipient: adminEmail,
        template: templates.contactAdminNotification(submission),
        metadata: { referenceCode: submission.referenceCode, submissionId: submission.id },
      });
    }
  });
}

function notifyVolunteerApplication(application) {
  dispatchEmail(async () => {
    await deliverEmail({
      type: 'volunteer_confirmation',
      recipient: application.email,
      template: templates.volunteerConfirmation(application),
      metadata: { referenceCode: application.referenceCode },
    });

    const adminEmail = await getAdminEmail();
    if (adminEmail) {
      await deliverEmail({
        type: 'volunteer_admin',
        recipient: adminEmail,
        template: templates.volunteerAdminNotification(application),
        metadata: { referenceCode: application.referenceCode, applicationId: application.id },
      });
    }
  });
}

function notifyPartnershipInquiry(inquiry) {
  dispatchEmail(async () => {
    await deliverEmail({
      type: 'partnership_confirmation',
      recipient: inquiry.email,
      template: templates.partnershipConfirmation(inquiry),
      metadata: { referenceCode: inquiry.referenceCode },
    });

    const adminEmail = await getAdminEmail();
    if (adminEmail) {
      await deliverEmail({
        type: 'partnership_admin',
        recipient: adminEmail,
        template: templates.partnershipAdminNotification(inquiry),
        metadata: { referenceCode: inquiry.referenceCode, inquiryId: inquiry.id },
      });
    }
  });
}

function notifyConcernSubmission(concern) {
  dispatchEmail(async () => {
    const adminEmail = await getAdminEmail();
    if (adminEmail) {
      await deliverEmail({
        type: 'concern_admin',
        recipient: adminEmail,
        template: templates.concernAdminNotification(concern),
        metadata: { referenceCode: concern.referenceCode, concernId: concern.id },
      });
    }
  });
}

async function notifyNewTender(tender) {
  const [subscribers, tendersEmail] = await Promise.all([
    prisma.tenderAlertSubscription.findMany({
      where: { isActive: true },
      select: { id: true, email: true },
    }),
    getTendersEmail(),
  ]);

  const recipientMap = new Map(subscribers.map((s) => [s.email, s.id]));
  if (tendersEmail) recipientMap.set(tendersEmail, null);

  let sent = 0;
  let failed = 0;

  for (const [email, subscriptionId] of recipientMap) {
    try {
      const result = await deliverEmail({
        type: 'tender_published',
        recipient: email,
        template: templates.newTenderAlert(tender, email),
        relations: {
          tenderId: tender.id,
          ...(subscriptionId ? { tenderAlertSubscriptionId: subscriptionId } : {}),
        },
        metadata: { tenderReferenceId: tender.referenceId },
      });
      if (result.status !== 'failed') sent += 1;
      else failed += 1;
    } catch {
      failed += 1;
    }
  }

  return { sent, failed, total: recipientMap.size };
}

function notifyDonationReceipt(donation) {
  if (!donation.donorEmail) return;

  dispatchEmail(async () => {
    await deliverEmail({
      type: 'donation_receipt',
      recipient: donation.donorEmail,
      template: templates.donationReceipt(donation),
      relations: { donationId: donation.id },
      metadata: { referenceCode: donation.referenceCode },
    });

    await prisma.donation.update({
      where: { id: donation.id },
      data: { receiptSent: true, receiptSentAt: new Date() },
    });
  });
}

async function sendNewsletterBroadcast({ subject, body, sentById = null }) {
  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: { status: 'subscribed' },
    select: { id: true, email: true },
  });

  const campaign = await prisma.newsletterCampaign.create({
    data: {
      subject,
      body,
      status: 'sending',
      recipientCount: subscribers.length,
      sentById,
    },
  });

  const bodyHtml = body.includes('<') ? body : `<p>${body.replace(/\n/g, '<br/>')}</p>`;
  let sent = 0;
  let failed = 0;

  for (const { id, email } of subscribers) {
    try {
      const template = templates.newsletterBroadcast({ subject, bodyHtml, email });
      const result = await deliverEmail({
        type: 'newsletter_broadcast',
        recipient: email,
        template,
        relations: {
          campaignId: campaign.id,
          newsletterSubscriberId: id,
        },
        sentById,
      });
      if (result.status === 'failed') failed += 1;
      else sent += 1;
    } catch {
      failed += 1;
    }
  }

  const campaignStatus = failed === subscribers.length && subscribers.length > 0 ? 'failed' : 'sent';
  await prisma.newsletterCampaign.update({
    where: { id: campaign.id },
    data: {
      status: campaignStatus,
      sentCount: sent,
      failedCount: failed,
      sentAt: new Date(),
    },
  });

  return { campaignId: campaign.id, sent, failed, total: subscribers.length };
}

async function sendTestEmail(to, sentById = null) {
  const template = {
    subject: `Test email — ${config.SMTP_FROM_NAME}`,
    html: templates.newsletterWelcome(to).html,
  };

  return deliverEmail({
    type: 'test',
    recipient: to,
    template,
    sentById,
  });
}

module.exports = {
  deliverEmail,
  notifyNewsletterWelcome,
  notifyTenderAlertWelcome,
  notifyContactSubmission,
  notifyVolunteerApplication,
  notifyPartnershipInquiry,
  notifyConcernSubmission,
  notifyNewTender,
  notifyDonationReceipt,
  sendNewsletterBroadcast,
  sendTestEmail,
  getAdminEmail,
};
