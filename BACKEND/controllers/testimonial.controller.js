const { prisma } = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler.middleware');

const getTestimonials = asyncHandler(async (req, res) => {
  const where = req.user ? {} : { isActive: true };

  const testimonials = await prisma.testimonial.findMany({
    where,
    orderBy: { sortOrder: 'asc' },
  });

  res.status(200).json({ success: true, count: testimonials.length, data: testimonials });
});

const createTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await prisma.testimonial.create({ data: req.body });
  res.status(201).json({ success: true, data: testimonial });
});

const updateTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await prisma.testimonial.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.status(200).json({ success: true, data: testimonial });
});

const deleteTestimonial = asyncHandler(async (req, res) => {
  await prisma.testimonial.delete({ where: { id: req.params.id } });
  res.status(200).json({ success: true, message: 'Testimonial deleted' });
});

module.exports = {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
};
