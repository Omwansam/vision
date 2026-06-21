const express = require('express');
const {
  unsubscribe,
  getEmailStatus,
  listTenderAlertSubscribers,
  sendNewsletter,
  sendTestEmail,
  listEmailNotifications,
  listNewsletterCampaigns,
} = require('../controllers/notification.controller');
const protect = require('../middleware/protect.middleware');
const authorize = require('../middleware/authorize.middleware');
const validate = require('../middleware/validate.middleware');

const notificationRouter = express.Router();

notificationRouter.get('/unsubscribe', unsubscribe);
notificationRouter.post('/unsubscribe', validate(['list', 'email', 'token']), unsubscribe);

notificationRouter.use(protect);

notificationRouter.get('/status', authorize('admin', 'editor'), getEmailStatus);
notificationRouter.get('/logs', authorize('admin', 'editor'), listEmailNotifications);
notificationRouter.get('/campaigns', authorize('admin', 'editor'), listNewsletterCampaigns);
notificationRouter.get('/tender-alerts', authorize('admin', 'editor', 'procurement'), listTenderAlertSubscribers);
notificationRouter.post('/newsletter/send', authorize('admin', 'editor'), validate(['subject', 'body']), sendNewsletter);
notificationRouter.post('/test', authorize('admin'), validate(['to']), sendTestEmail);

module.exports = notificationRouter;
