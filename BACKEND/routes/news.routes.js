const express = require('express');
const {
  getNewsArticles,
  getNewsBySlug,
  createNewsArticle,
  updateNewsArticle,
  deleteNewsArticle,
} = require('../controllers/news.controller');
const { newsUpload } = require('../middleware/upload.middleware');
const protect = require('../middleware/protect.middleware');
const authorize = require('../middleware/authorize.middleware');
const { CONTENT_ROLES } = authorize;

const newsRouter = express.Router();

newsRouter.get('/', getNewsArticles);
newsRouter.get('/:slug', getNewsBySlug);

newsRouter.post('/', protect, authorize(...CONTENT_ROLES), newsUpload.single('image'), createNewsArticle);
newsRouter.put('/:id', protect, authorize(...CONTENT_ROLES), newsUpload.single('image'), updateNewsArticle);
newsRouter.delete('/:id', protect, authorize(...CONTENT_ROLES), deleteNewsArticle);

module.exports = newsRouter;
