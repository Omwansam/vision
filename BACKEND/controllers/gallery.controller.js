const { prisma } = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler.middleware');
const { buildStoredImagePath } = require('../utils/uploadPath');
const { createMediaRecord, removeStoredFile } = require('./upload.controller');

function parseGalleryFields(body) {
  const data = {};

  if (body.title !== undefined) data.title = body.title.trim();
  if (body.category !== undefined) data.category = body.category.trim();
  if (body.altText !== undefined) data.altText = body.altText?.trim() || null;
  if (body.status !== undefined) data.status = body.status;
  if (body.sortOrder !== undefined) data.sortOrder = parseInt(body.sortOrder, 10) || 0;
  if (body.url !== undefined) data.url = body.url?.trim() || null;
  if (body.mediaId !== undefined) data.mediaId = body.mediaId || null;

  return data;
}

function validateGalleryPayload(data, requireImage = false) {
  if (!data.title) {
    return 'Title is required';
  }
  if (!data.category) {
    return 'Category is required';
  }
  if (requireImage && !data.url) {
    return 'Image file or URL is required';
  }
  return null;
}

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
  const data = parseGalleryFields(req.body);

  if (req.file) {
    const media = await createMediaRecord(req.file, 'gallery', req.user.id);
    data.url = buildStoredImagePath('gallery', req.file.filename);
    data.mediaId = media.id;
  }

  const validationError = validateGalleryPayload(data, true);
  if (validationError) {
    return res.status(400).json({ success: false, error: validationError });
  }

  const image = await prisma.galleryImage.create({
    data: {
      title: data.title,
      category: data.category,
      url: data.url,
      altText: data.altText,
      status: data.status || 'published',
      sortOrder: data.sortOrder ?? 0,
      mediaId: data.mediaId,
    },
  });

  res.status(201).json({ success: true, data: image });
});

const updateGalleryImage = asyncHandler(async (req, res) => {
  const existing = await prisma.galleryImage.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    return res.status(404).json({ success: false, error: 'Gallery image not found' });
  }

  const data = parseGalleryFields(req.body);

  if (req.file) {
    const media = await createMediaRecord(req.file, 'gallery', req.user.id);
    data.url = buildStoredImagePath('gallery', req.file.filename);
    data.mediaId = media.id;

    if (existing.url?.startsWith('/uploads/')) {
      removeStoredFile(existing.url);
    }
  }

  const validationError = validateGalleryPayload({ ...existing, ...data });
  if (validationError) {
    return res.status(400).json({ success: false, error: validationError });
  }

  const image = await prisma.galleryImage.update({
    where: { id: req.params.id },
    data,
  });

  res.status(200).json({ success: true, data: image });
});

const deleteGalleryImage = asyncHandler(async (req, res) => {
  const existing = await prisma.galleryImage.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    return res.status(404).json({ success: false, error: 'Gallery image not found' });
  }

  await prisma.galleryImage.delete({ where: { id: req.params.id } });

  if (existing.url?.startsWith('/uploads/')) {
    removeStoredFile(existing.url);
  }

  res.status(200).json({ success: true, message: 'Gallery image deleted' });
});

module.exports = {
  getGalleryImages,
  createGalleryImage,
  updateGalleryImage,
  deleteGalleryImage,
};
