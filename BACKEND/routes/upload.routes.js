const express = require('express');
const { uploadImage } = require('../controllers/upload.controller');
const { dynamicImageUpload, uploadFolderGuard } = require('../middleware/upload.middleware');
const protect = require('../middleware/protect.middleware');
const authorize = require('../middleware/authorize.middleware');
const { CONTENT_ROLES } = authorize;

const uploadRouter = express.Router();

uploadRouter.post(
  '/:folder',
  protect,
  authorize(...CONTENT_ROLES),
  uploadFolderGuard,
  dynamicImageUpload,
  uploadImage,
);

module.exports = uploadRouter;
