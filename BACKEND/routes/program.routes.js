const express = require('express');
const {
  getPrograms,
  getProgramBySlug,
  createProgram,
  updateProgram,
  deleteProgram,
} = require('../controllers/program.controller');
const protect = require('../middleware/protect.middleware');
const authorize = require('../middleware/authorize.middleware');
const validate = require('../middleware/validate.middleware');
const { CONTENT_ROLES } = authorize;

const programRouter = express.Router();

programRouter.get('/', getPrograms);
programRouter.get('/:slug', getProgramBySlug);

programRouter.post('/', protect, authorize(...CONTENT_ROLES), validate(['slug', 'title', 'description']), createProgram);
programRouter.put('/:id', protect, authorize(...CONTENT_ROLES), updateProgram);
programRouter.delete('/:id', protect, authorize(...CONTENT_ROLES), deleteProgram);

module.exports = programRouter;
