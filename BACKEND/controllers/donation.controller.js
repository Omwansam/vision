const { prisma } = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler.middleware');
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

const createDonation = asyncHandler(async (req, res) => {
  const {
    donorName,
    donorEmail,
    donorPhone,
    amount,
    currency,
    type,
    designation,
    programId,
  } = req.body;

  const parsedAmount = parseFloat(amount);
  if (!parsedAmount || parsedAmount <= 0) {
    return res.status(400).json({ success: false, error: 'Valid amount is required' });
  }

  const donation = await prisma.donation.create({
    data: {
      donorName,
      donorEmail: donorEmail?.trim().toLowerCase(),
      donorPhone,
      amount: parsedAmount,
      currency: currency || 'KES',
      type: type || 'one_time',
      designation: designation || 'general',
      programId: programId || null,
      status: 'pending',
      ipAddress: req.ip || null,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Donation pledge recorded. Payment instructions will follow.',
    data: {
      referenceCode: donation.referenceCode,
      amount: donation.amount,
      currency: donation.currency,
      type: donation.type,
      designation: donation.designation,
      status: donation.status,
    },
  });
});

const getDonationStatus = asyncHandler(async (req, res) => {
  const donation = await prisma.donation.findFirst({
    where: {
      OR: [
        { referenceCode: req.params.reference },
        { id: req.params.reference },
      ],
    },
    select: {
      id: true,
      referenceCode: true,
      amount: true,
      currency: true,
      type: true,
      designation: true,
      status: true,
      completedAt: true,
      createdAt: true,
    },
  });

  if (!donation) {
    return res.status(404).json({ success: false, error: 'Donation not found' });
  }

  res.status(200).json({ success: true, data: donation });
});

const getDonations = asyncHandler(async (req, res) => {
  const { status, designation } = req.query;
  const { page, limit, skip } = parsePagination(req.query);

  const where = {};
  if (status) where.status = status;
  if (designation) where.designation = designation;

  const [donations, total] = await Promise.all([
    prisma.donation.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { program: { select: { id: true, title: true, slug: true } } },
    }),
    prisma.donation.count({ where }),
  ]);

  res.status(200).json(paginatedResponse(donations, total, page, limit));
});

const updateDonation = asyncHandler(async (req, res) => {
  const { status, paymentProvider, paymentRef, transactionId, completedAt } = req.body;
  const data = {};

  if (status !== undefined) data.status = status;
  if (paymentProvider !== undefined) data.paymentProvider = paymentProvider;
  if (paymentRef !== undefined) data.paymentRef = paymentRef;
  if (transactionId !== undefined) data.transactionId = transactionId;
  if (completedAt !== undefined) data.completedAt = completedAt ? new Date(completedAt) : null;
  if (status === 'completed' && !completedAt) data.completedAt = new Date();

  const existing = await prisma.donation.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    return res.status(404).json({ success: false, error: 'Donation not found' });
  }

  const donation = await prisma.donation.update({
    where: { id: req.params.id },
    data,
  });

  if (
    status === 'completed'
    && existing.status !== 'completed'
    && donation.donorEmail
    && !donation.receiptSent
  ) {
    notifications.notifyDonationReceipt(donation);
  }

  res.status(200).json({ success: true, data: donation });
});

module.exports = {
  createDonation,
  getDonationStatus,
  getDonations,
  updateDonation,
};
