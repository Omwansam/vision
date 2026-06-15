const express = require('express');
const {
  getPartners,
  createPartner,
  updatePartner,
  deletePartner,
} = require('../controllers/partner.controller');
const protect = require('../middleware/protect.middleware');
const authorize = require('../middleware/authorize.middleware');
const validate = require('../middleware/validate.middleware');
const { CONTENT_ROLES } = authorize;

const partnerRouter = express.Router();

partnerRouter.get('/', getPartners);

partnerRouter.post('/', protect, authorize(...CONTENT_ROLES), validate(['name', 'type']), createPartner);
partnerRouter.put('/:id', protect, authorize(...CONTENT_ROLES), updatePartner);
partnerRouter.delete('/:id', protect, authorize(...CONTENT_ROLES), deletePartner);

module.exports = partnerRouter;
