const express = require('express');
const {
  listContacts,
  updateContactStatus,
  listVolunteers,
  updateVolunteerStatus,
  listPartnerships,
  updatePartnershipStatus,
  listConcerns,
  updateConcernStatus,
  addSubmissionNote,
  listNewsletterSubscribers,
} = require('../controllers/submission.controller');
const protect = require('../middleware/protect.middleware');
const authorize = require('../middleware/authorize.middleware');
const validate = require('../middleware/validate.middleware');

const submissionRouter = express.Router();

submissionRouter.use(protect);
submissionRouter.use(authorize('admin', 'editor'));

submissionRouter.get('/contact', listContacts);
submissionRouter.patch('/contact/:id', validate(['status']), updateContactStatus);

submissionRouter.get('/volunteers', listVolunteers);
submissionRouter.patch('/volunteers/:id', validate(['status']), updateVolunteerStatus);

submissionRouter.get('/partnerships', listPartnerships);
submissionRouter.patch('/partnerships/:id', validate(['status']), updatePartnershipStatus);

submissionRouter.get('/concerns', authorize('admin'), listConcerns);
submissionRouter.patch('/concerns/:id', authorize('admin'), validate(['status']), updateConcernStatus);

submissionRouter.post('/:id/notes', validate(['note', 'type']), addSubmissionNote);

submissionRouter.get('/newsletter', listNewsletterSubscribers);

module.exports = submissionRouter;
