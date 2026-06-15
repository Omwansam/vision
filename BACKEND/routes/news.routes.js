const express = require('express');
const {
  getNewsArticles,
  getNewsBySlug,
  createNewsArticle,
  updateNewsArticle,
  deleteNewsArticle,
} = require('../controllers/news.controller');
const protect = require('../middleware/protect.middleware');
const authorize = require('../middleware/authorize.middleware');
const validate = require('../middleware/validate.middleware');
const { CONTENT_ROLES } = authorize;

const newsRouter = express.Router();

newsRouter.get('/', getNewsArticles);
newsRouter.get('/:slug', getNewsBySlug);

newsRouter.post('/', protect, authorize(...CONTENT_ROLES), validate(['slug', 'title', 'excerpt', 'category']), createNewsArticle);
newsRouter.put('/:id', protect, authorize(...CONTENT_ROLES), updateNewsArticle);
newsRouter.delete('/:id', protect, authorize(...CONTENT_ROLES), deleteNewsArticle);

module.exports = newsRouter;
