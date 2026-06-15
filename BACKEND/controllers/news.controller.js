const { prisma } = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler.middleware');

function parsePagination(query, defaultLimit = 20) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

function paginatedResponse(data, total, page, limit) {
  return {
    success: true,
    count: data.length,
    total,
    page,
    pages: Math.ceil(total / limit) || 1,
    data,
  };
}

const getNewsArticles = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { category } = req.query;

  const where = req.user ? {} : { status: 'published' };
  if (category) where.category = category;

  const [articles, total] = await Promise.all([
    prisma.newsArticle.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ isFeatured: 'desc' }, { publishedAt: 'desc' }],
    }),
    prisma.newsArticle.count({ where }),
  ]);

  res.status(200).json(paginatedResponse(articles, total, page, limit));
});

const getNewsBySlug = asyncHandler(async (req, res) => {
  const where = { slug: req.params.slug };
  if (!req.user) where.status = 'published';

  const article = await prisma.newsArticle.findFirst({ where });

  if (!article) {
    return res.status(404).json({ success: false, error: 'Article not found' });
  }

  res.status(200).json({ success: true, data: article });
});

const createNewsArticle = asyncHandler(async (req, res) => {
  const { slug, title, excerpt, body, category, imageUrl, status, isFeatured, publishedAt } = req.body;

  const article = await prisma.newsArticle.create({
    data: {
      slug,
      title,
      excerpt,
      body,
      category,
      imageUrl,
      status: status || 'draft',
      isFeatured: isFeatured ?? false,
      publishedAt: publishedAt ? new Date(publishedAt) : status === 'published' ? new Date() : null,
      authorId: req.user.id,
    },
  });

  res.status(201).json({ success: true, data: article });
});

const updateNewsArticle = asyncHandler(async (req, res) => {
  const { publishedAt, ...fields } = req.body;
  const data = { ...fields };

  if (publishedAt !== undefined) {
    data.publishedAt = publishedAt ? new Date(publishedAt) : null;
  }

  const article = await prisma.newsArticle.update({
    where: { id: req.params.id },
    data,
  });

  res.status(200).json({ success: true, data: article });
});

const deleteNewsArticle = asyncHandler(async (req, res) => {
  await prisma.newsArticle.delete({ where: { id: req.params.id } });
  res.status(200).json({ success: true, message: 'Article deleted' });
});

module.exports = {
  getNewsArticles,
  getNewsBySlug,
  createNewsArticle,
  updateNewsArticle,
  deleteNewsArticle,
};
