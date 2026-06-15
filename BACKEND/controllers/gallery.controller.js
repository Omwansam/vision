const { prisma } = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler.middleware');

const getGalleryImages = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const where = req.user ? {} : { status: 'published' };
  if (category) where.category = category;

  const images = await prisma.galleryImage.findMany({
    where,
    orderBy: { sortOrder: 'asc' },
  });

  res.status(200).json({ success: true, count: images.length, data: images });
});

const createGalleryImage = asyncHandler(async (req, res) => {
  const image = await prisma.galleryImage.create({ data: req.body });
  res.status(201).json({ success: true, data: image });
});

const updateGalleryImage = asyncHandler(async (req, res) => {
  const image = await prisma.galleryImage.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.status(200).json({ success: true, data: image });
});

const deleteGalleryImage = asyncHandler(async (req, res) => {
  await prisma.galleryImage.delete({ where: { id: req.params.id } });
  res.status(200).json({ success: true, message: 'Gallery image deleted' });
});

module.exports = {
  getGalleryImages,
  createGalleryImage,
  updateGalleryImage,
  deleteGalleryImage,
};
