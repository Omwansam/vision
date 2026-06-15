const express = require('express');
const {
  submitContact,
  subscribeNewsletter,
  submitVolunteer,
  submitPartnership,
  submitConcern,
} = require('../controllers/form.controller');
const validate = require('../middleware/validate.middleware');

const formRouter = express.Router();

formRouter.post('/contact', validate(['fullName', 'email', 'subject', 'message']), submitContact);
formRouter.post('/newsletter/subscribe', validate(['email']), subscribeNewsletter);
formRouter.post('/volunteers', validate(['fullName', 'email']), submitVolunteer);
formRouter.post('/partnerships', validate(['organizationName', 'contactName', 'email', 'vision']), submitPartnership);
formRouter.post('/concerns', validate(['message']), submitConcern);

module.exports = formRouter;
