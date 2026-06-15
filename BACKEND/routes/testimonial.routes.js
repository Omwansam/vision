const express = require('express');
const {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} = require('../controllers/testimonial.controller');
const protect = require('../middleware/protect.middleware');
const authorize = require('../middleware/authorize.middleware');
const validate = require('../middleware/validate.middleware');
const { CONTENT_ROLES } = authorize;

const testimonialRouter = express.Router();

testimonialRouter.get('/', getTestimonials);

testimonialRouter.post('/', protect, authorize(...CONTENT_ROLES), validate(['quote', 'name']), createTestimonial);
testimonialRouter.put('/:id', protect, authorize(...CONTENT_ROLES), updateTestimonial);
testimonialRouter.delete('/:id', protect, authorize(...CONTENT_ROLES), deleteTestimonial);

module.exports = testimonialRouter;
