const express = require('express');
const {
  getGalleryImages,
  createGalleryImage,
  updateGalleryImage,
  deleteGalleryImage,
} = require('../controllers/gallery.controller');
const protect = require('../middleware/protect.middleware');
const authorize = require('../middleware/authorize.middleware');
const validate = require('../middleware/validate.middleware');
const { CONTENT_ROLES } = authorize;

const galleryRouter = express.Router();

galleryRouter.get('/', getGalleryImages);

galleryRouter.post('/', protect, authorize(...CONTENT_ROLES), validate(['title', 'category', 'url']), createGalleryImage);
galleryRouter.put('/:id', protect, authorize(...CONTENT_ROLES), updateGalleryImage);
galleryRouter.delete('/:id', protect, authorize(...CONTENT_ROLES), deleteGalleryImage);

module.exports = galleryRouter;
