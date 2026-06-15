const express = require('express');
const {
  createDonation,
  getDonationStatus,
  getDonations,
  updateDonation,
} = require('../controllers/donation.controller');
const protect = require('../middleware/protect.middleware');
const authorize = require('../middleware/authorize.middleware');
const validate = require('../middleware/validate.middleware');
const { FINANCE_ROLES } = authorize;

const donationRouter = express.Router();

donationRouter.post('/', validate(['amount']), createDonation);

donationRouter.get('/', protect, authorize(...FINANCE_ROLES), getDonations);
donationRouter.get('/:reference/status', getDonationStatus);
donationRouter.patch('/:id', protect, authorize(...FINANCE_ROLES), updateDonation);

module.exports = donationRouter;
