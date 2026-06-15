const express = require('express');
const {
  getTenders,
  getTenderByReference,
  createTender,
  updateTender,
  deleteTender,
  addTenderDocument,
  submitBid,
  subscribeTenderAlerts,
} = require('../controllers/tender.controller');
const protect = require('../middleware/protect.middleware');
const authorize = require('../middleware/authorize.middleware');
const validate = require('../middleware/validate.middleware');
const { PROCUREMENT_ROLES } = authorize;

const tenderRouter = express.Router();

tenderRouter.get('/', getTenders);
tenderRouter.post('/alerts/subscribe', validate(['email']), subscribeTenderAlerts);
tenderRouter.get('/by-reference/:referenceId', getTenderByReference);
tenderRouter.post('/:id/bids', validate(['companyName', 'contactName', 'email']), submitBid);

tenderRouter.post('/', protect, authorize(...PROCUREMENT_ROLES), validate(['referenceId', 'title', 'description', 'category', 'publishedAt', 'deadline']), createTender);
tenderRouter.put('/:id', protect, authorize(...PROCUREMENT_ROLES), updateTender);
tenderRouter.delete('/:id', protect, authorize('admin', 'procurement'), deleteTender);
tenderRouter.post('/:id/documents', protect, authorize(...PROCUREMENT_ROLES), validate(['title', 'fileUrl']), addTenderDocument);

module.exports = tenderRouter;
