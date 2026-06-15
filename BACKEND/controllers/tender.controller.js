const { prisma } = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler.middleware');

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

const tenderInclude = {
  documents: true,
};

const getTenders = asyncHandler(async (req, res) => {
  const { status, category } = req.query;
  const { page, limit, skip } = parsePagination(req.query);

  const where = {};
  if (status) where.status = status;
  if (category) where.category = category;

  const [tenders, total] = await Promise.all([
    prisma.tender.findMany({
      where,
      skip,
      take: limit,
      include: { documents: { where: { isPublic: true } } },
      orderBy: [{ status: 'asc' }, { deadline: 'asc' }],
    }),
    prisma.tender.count({ where }),
  ]);

  res.status(200).json(paginatedResponse(tenders, total, page, limit));
});

const getTenderByReference = asyncHandler(async (req, res) => {
  const referenceId = decodeURIComponent(req.params.referenceId);

  const tender = await prisma.tender.findUnique({
    where: { referenceId },
    include: tenderInclude,
  });

  if (!tender) {
    return res.status(404).json({ success: false, error: 'Tender not found' });
  }

  res.status(200).json({ success: true, data: tender });
});

const createTender = asyncHandler(async (req, res) => {
  const {
    referenceId,
    title,
    description,
    category,
    status,
    publishedAt,
    deadline,
    location,
    budgetMin,
    budgetMax,
    budgetLabel,
    currency,
  } = req.body;

  const tender = await prisma.tender.create({
    data: {
      referenceId,
      title,
      description,
      category,
      status: status || 'open',
      publishedAt: new Date(publishedAt),
      deadline: new Date(deadline),
      location,
      budgetMin,
      budgetMax,
      budgetLabel,
      currency: currency || 'KES',
      createdById: req.user.id,
      updatedById: req.user.id,
    },
    include: tenderInclude,
  });

  await prisma.tenderAuditLog.create({
    data: {
      tenderId: tender.id,
      userId: req.user.id,
      action: 'created',
      details: { referenceId },
    },
  });

  res.status(201).json({ success: true, data: tender });
});

const updateTender = asyncHandler(async (req, res) => {
  const { publishedAt, deadline, awardedAt, ...fields } = req.body;
  const data = { ...fields, updatedById: req.user.id };

  if (publishedAt !== undefined) data.publishedAt = new Date(publishedAt);
  if (deadline !== undefined) data.deadline = new Date(deadline);
  if (awardedAt !== undefined) data.awardedAt = awardedAt ? new Date(awardedAt) : null;

  const existing = await prisma.tender.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    return res.status(404).json({ success: false, error: 'Tender not found' });
  }

  const tender = await prisma.tender.update({
    where: { id: req.params.id },
    data,
    include: tenderInclude,
  });

  if (fields.status && fields.status !== existing.status) {
    await prisma.tenderAuditLog.create({
      data: {
        tenderId: tender.id,
        userId: req.user.id,
        action: 'status_changed',
        details: { from: existing.status, to: fields.status },
      },
    });
  }

  res.status(200).json({ success: true, data: tender });
});

const deleteTender = asyncHandler(async (req, res) => {
  await prisma.tender.delete({ where: { id: req.params.id } });
  res.status(200).json({ success: true, message: 'Tender deleted' });
});

const addTenderDocument = asyncHandler(async (req, res) => {
  const doc = await prisma.tenderDocument.create({
    data: {
      tenderId: req.params.id,
      ...req.body,
    },
  });

  await prisma.tenderAuditLog.create({
    data: {
      tenderId: req.params.id,
      userId: req.user.id,
      action: 'document_uploaded',
      details: { documentId: doc.id, title: doc.title },
    },
  });

  res.status(201).json({ success: true, data: doc });
});

const submitBid = asyncHandler(async (req, res) => {
  const tender = await prisma.tender.findUnique({ where: { id: req.params.id } });

  if (!tender || tender.status !== 'open') {
    return res.status(400).json({ success: false, error: 'Tender is not open for bids' });
  }

  if (new Date() > tender.deadline) {
    return res.status(400).json({ success: false, error: 'Tender deadline has passed' });
  }

  const bid = await prisma.tenderBid.create({
    data: {
      tenderId: tender.id,
      ...req.body,
    },
  });

  await prisma.tenderAuditLog.create({
    data: {
      tenderId: tender.id,
      action: 'bid_received',
      details: { bidId: bid.id, companyName: bid.companyName },
    },
  });

  res.status(201).json({
    success: true,
    message: 'Bid submitted successfully',
    data: { id: bid.id, submittedAt: bid.submittedAt },
  });
});

const subscribeTenderAlerts = asyncHandler(async (req, res) => {
  const { email, name, companyName } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  const subscription = await prisma.tenderAlertSubscription.upsert({
    where: { email: normalizedEmail },
    update: { name, companyName, isActive: true, unsubscribedAt: null },
    create: { email: normalizedEmail, name, companyName },
  });

  res.status(200).json({
    success: true,
    message: 'Subscribed to tender alerts',
    data: { id: subscription.id, email: subscription.email },
  });
});

module.exports = {
  getTenders,
  getTenderByReference,
  createTender,
  updateTender,
  deleteTender,
  addTenderDocument,
  submitBid,
  subscribeTenderAlerts,
};
