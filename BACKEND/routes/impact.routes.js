const express = require('express');
const {
  getImpactData,
  upsertImpactHighlight,
  deleteImpactHighlight,
  upsertProgramOutcome,
  deleteProgramOutcome,
} = require('../controllers/impact.controller');
const protect = require('../middleware/protect.middleware');
const authorize = require('../middleware/authorize.middleware');
const { CONTENT_ROLES } = authorize;

const impactRouter = express.Router();

impactRouter.get('/', getImpactData);

impactRouter.post('/highlights', protect, authorize(...CONTENT_ROLES), upsertImpactHighlight);
impactRouter.delete('/highlights/:id', protect, authorize(...CONTENT_ROLES), deleteImpactHighlight);
impactRouter.post('/outcomes', protect, authorize(...CONTENT_ROLES), upsertProgramOutcome);
impactRouter.delete('/outcomes/:id', protect, authorize(...CONTENT_ROLES), deleteProgramOutcome);

module.exports = impactRouter;
