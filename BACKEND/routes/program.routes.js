const express = require('express');
const {
  getPrograms,
  getProgramBySlug,
  createProgram,
  updateProgram,
  deleteProgram,
} = require('../controllers/program.controller');
const { programsUpload } = require('../middleware/upload.middleware');
const protect = require('../middleware/protect.middleware');
const authorize = require('../middleware/authorize.middleware');
const { CONTENT_ROLES } = authorize;

const programRouter = express.Router();

programRouter.get('/', getPrograms);
programRouter.get('/:slug', getProgramBySlug);

programRouter.post('/', protect, authorize(...CONTENT_ROLES), programsUpload.single('image'), createProgram);
programRouter.put('/:id', protect, authorize(...CONTENT_ROLES), programsUpload.single('image'), updateProgram);
programRouter.delete('/:id', protect, authorize(...CONTENT_ROLES), deleteProgram);

module.exports = programRouter;
