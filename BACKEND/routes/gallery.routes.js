const express = require('express');
const {
  getGalleryImages,
  createGalleryImage,
  updateGalleryImage,
  deleteGalleryImage,
} = require('../controllers/gallery.controller');
const { galleryUpload } = require('../middleware/upload.middleware');
const protect = require('../middleware/protect.middleware');
const authorize = require('../middleware/authorize.middleware');
const { CONTENT_ROLES } = authorize;

const galleryRouter = express.Router();

galleryRouter.get('/', getGalleryImages);

galleryRouter.post(
  '/',
  protect,
  authorize(...CONTENT_ROLES),
  galleryUpload.single('image'),
  createGalleryImage,
);

galleryRouter.put(
  '/:id',
  protect,
  authorize(...CONTENT_ROLES),
  galleryUpload.single('image'),
  updateGalleryImage,
);

galleryRouter.delete('/:id', protect, authorize(...CONTENT_ROLES), deleteGalleryImage);

module.exports = galleryRouter;
