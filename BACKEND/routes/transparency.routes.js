const express = require('express');
const {
  getTransparencyData,
  upsertFundAllocation,
  createTransparencyDocument,
  updateTransparencyDocument,
  deleteTransparencyDocument,
} = require('../controllers/transparency.controller');
const protect = require('../middleware/protect.middleware');
const authorize = require('../middleware/authorize.middleware');
const validate = require('../middleware/validate.middleware');
const { CONTENT_ROLES, FINANCE_ROLES } = authorize;

const transparencyRouter = express.Router();

transparencyRouter.get('/', getTransparencyData);

transparencyRouter.post('/fund-allocation', protect, authorize(...FINANCE_ROLES), upsertFundAllocation);
transparencyRouter.post('/documents', protect, authorize(...CONTENT_ROLES, ...FINANCE_ROLES), validate(['title', 'category']), createTransparencyDocument);
transparencyRouter.put('/documents/:id', protect, authorize(...CONTENT_ROLES, ...FINANCE_ROLES), updateTransparencyDocument);
transparencyRouter.delete('/documents/:id', protect, authorize('admin', 'finance'), deleteTransparencyDocument);

module.exports = transparencyRouter;
