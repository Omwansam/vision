const { prisma } = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler.middleware');

const getTransparencyData = asyncHandler(async (req, res) => {
  const year = parseInt(req.query.year, 10) || new Date().getFullYear();

  const [fundAllocation, documents] = await Promise.all([
    prisma.fundAllocation.findMany({
      where: { year },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.transparencyDocument.findMany({
      where: req.user ? {} : { status: 'published', isPublic: true },
      orderBy: [{ year: 'desc' }, { title: 'asc' }],
    }),
  ]);

  res.status(200).json({
    success: true,
    data: { year, fundAllocation, documents },
  });
});

const upsertFundAllocation = asyncHandler(async (req, res) => {
  const { category, percentage, year, sortOrder } = req.body;

  const item = await prisma.fundAllocation.upsert({
    where: { year_category: { year, category } },
    update: { percentage, sortOrder },
    create: { category, percentage, year, sortOrder: sortOrder ?? 0 },
  });

  res.status(200).json({ success: true, data: item });
});

const createTransparencyDocument = asyncHandler(async (req, res) => {
  const doc = await prisma.transparencyDocument.create({
    data: {
      ...req.body,
      uploadedById: req.user.id,
    },
  });
  res.status(201).json({ success: true, data: doc });
});

const updateTransparencyDocument = asyncHandler(async (req, res) => {
  const doc = await prisma.transparencyDocument.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.status(200).json({ success: true, data: doc });
});

const deleteTransparencyDocument = asyncHandler(async (req, res) => {
  await prisma.transparencyDocument.delete({ where: { id: req.params.id } });
  res.status(200).json({ success: true, message: 'Document deleted' });
});

module.exports = {
  getTransparencyData,
  upsertFundAllocation,
  createTransparencyDocument,
  updateTransparencyDocument,
  deleteTransparencyDocument,
};
