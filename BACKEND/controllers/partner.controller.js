const { prisma } = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler.middleware');

const getPartners = asyncHandler(async (req, res) => {
  const where = req.user ? {} : { isActive: true };

  const partners = await prisma.partner.findMany({
    where,
    orderBy: { sortOrder: 'asc' },
  });

  res.status(200).json({ success: true, count: partners.length, data: partners });
});

const createPartner = asyncHandler(async (req, res) => {
  const partner = await prisma.partner.create({ data: req.body });
  res.status(201).json({ success: true, data: partner });
});

const updatePartner = asyncHandler(async (req, res) => {
  const partner = await prisma.partner.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.status(200).json({ success: true, data: partner });
});

const deletePartner = asyncHandler(async (req, res) => {
  await prisma.partner.delete({ where: { id: req.params.id } });
  res.status(200).json({ success: true, message: 'Partner deleted' });
});

module.exports = { getPartners, createPartner, updatePartner, deletePartner };
