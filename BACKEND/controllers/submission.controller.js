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

const listContacts = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const { page, limit, skip } = parsePagination(req.query);
  const where = status ? { status } : {};

  const [items, total] = await Promise.all([
    prisma.contactSubmission.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { notes: { orderBy: { createdAt: 'desc' }, take: 3 } },
    }),
    prisma.contactSubmission.count({ where }),
  ]);

  res.status(200).json(paginatedResponse(items, total, page, limit));
});

const updateContactStatus = asyncHandler(async (req, res) => {
  const item = await prisma.contactSubmission.update({
    where: { id: req.params.id },
    data: { status: req.body.status },
  });
  res.status(200).json({ success: true, data: item });
});

const listVolunteers = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const { page, limit, skip } = parsePagination(req.query);
  const where = status ? { status } : {};

  const [items, total] = await Promise.all([
    prisma.volunteerApplication.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.volunteerApplication.count({ where }),
  ]);

  res.status(200).json(paginatedResponse(items, total, page, limit));
});

const updateVolunteerStatus = asyncHandler(async (req, res) => {
  const item = await prisma.volunteerApplication.update({
    where: { id: req.params.id },
    data: { status: req.body.status },
  });
  res.status(200).json({ success: true, data: item });
});

const listPartnerships = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const { page, limit, skip } = parsePagination(req.query);
  const where = status ? { status } : {};

  const [items, total] = await Promise.all([
    prisma.partnershipInquiry.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.partnershipInquiry.count({ where }),
  ]);

  res.status(200).json(paginatedResponse(items, total, page, limit));
});

const updatePartnershipStatus = asyncHandler(async (req, res) => {
  const item = await prisma.partnershipInquiry.update({
    where: { id: req.params.id },
    data: { status: req.body.status },
  });
  res.status(200).json({ success: true, data: item });
});

const listConcerns = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const { page, limit, skip } = parsePagination(req.query);
  const where = status ? { status } : {};

  const [items, total] = await Promise.all([
    prisma.concernSubmission.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.concernSubmission.count({ where }),
  ]);

  res.status(200).json(paginatedResponse(items, total, page, limit));
});

const updateConcernStatus = asyncHandler(async (req, res) => {
  const item = await prisma.concernSubmission.update({
    where: { id: req.params.id },
    data: { status: req.body.status },
  });
  res.status(200).json({ success: true, data: item });
});

const addSubmissionNote = asyncHandler(async (req, res) => {
  const { note, type } = req.body;
  const id = req.params.id;

  const data = {
    note,
    authorId: req.user.id,
  };

  if (type === 'contact') data.contactSubmissionId = id;
  else if (type === 'volunteer') data.volunteerApplicationId = id;
  else if (type === 'partnership') data.partnershipInquiryId = id;
  else if (type === 'concern') data.concernSubmissionId = id;
  else {
    return res.status(400).json({ success: false, error: 'Invalid submission type' });
  }

  const submissionNote = await prisma.submissionNote.create({ data });
  res.status(201).json({ success: true, data: submissionNote });
});

const listNewsletterSubscribers = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const { page, limit, skip } = parsePagination(req.query);
  const where = status ? { status } : {};

  const [items, total] = await Promise.all([
    prisma.newsletterSubscriber.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.newsletterSubscriber.count({ where }),
  ]);

  res.status(200).json(paginatedResponse(items, total, page, limit));
});

module.exports = {
  listContacts,
  updateContactStatus,
  listVolunteers,
  updateVolunteerStatus,
  listPartnerships,
  updatePartnershipStatus,
  listConcerns,
  updateConcernStatus,
  addSubmissionNote,
  listNewsletterSubscribers,
};
