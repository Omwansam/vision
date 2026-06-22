const express = require('express');
const { getSiteSettings, updateSiteSettings } = require('../controllers/site.controller');
const { siteImagesUpload } = require('../middleware/upload.middleware');
const protect = require('../middleware/protect.middleware');
const authorize = require('../middleware/authorize.middleware');
const { CONTENT_ROLES } = authorize;

const siteRouter = express.Router();

siteRouter.get('/', getSiteSettings);
siteRouter.put('/', protect, authorize(...CONTENT_ROLES), siteImagesUpload, updateSiteSettings);

module.exports = siteRouter;
