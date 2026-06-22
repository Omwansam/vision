const { prisma } = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler.middleware');
const { buildStoredImagePath } = require('../utils/uploadPath');
const { parseBool } = require('../utils/parseFormValue');
const { createMediaRecord, removeStoredFile } = require('./upload.controller');

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

function parseNewsFields(body) {
  const data = {};

  if (body.slug !== undefined) data.slug = body.slug.trim();
  if (body.title !== undefined) data.title = body.title.trim();
  if (body.excerpt !== undefined) data.excerpt = body.excerpt.trim();
  if (body.body !== undefined) data.body = body.body;
  if (body.category !== undefined) data.category = body.category.trim();
  if (body.imageUrl !== undefined) data.imageUrl = body.imageUrl?.trim() || null;
  if (body.status !== undefined) data.status = body.status;

  const isFeatured = parseBool(body.isFeatured);
  if (isFeatured !== undefined) data.isFeatured = isFeatured;

  if (body.publishedAt !== undefined) {
    data.publishedAt = body.publishedAt ? new Date(body.publishedAt) : null;
  }

  return data;
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
  const data = parseNewsFields(req.body);

  if (req.file) {
    await createMediaRecord(req.file, 'news', req.user.id);
    data.imageUrl = buildStoredImagePath('news', req.file.filename);
  }

  if (!data.slug || !data.title || !data.excerpt || !data.category) {
    return res.status(400).json({ success: false, error: 'slug, title, excerpt, and category are required' });
  }

  const status = data.status || 'draft';
  const publishedAt = data.publishedAt !== undefined
    ? data.publishedAt
    : status === 'published'
      ? new Date()
      : null;

  const article = await prisma.newsArticle.create({
    data: {
      slug: data.slug,
      title: data.title,
      excerpt: data.excerpt,
      body: data.body,
      category: data.category,
      imageUrl: data.imageUrl,
      status,
      isFeatured: data.isFeatured ?? false,
      publishedAt,
      authorId: req.user.id,
    },
  });

  res.status(201).json({ success: true, data: article });
});

const updateNewsArticle = asyncHandler(async (req, res) => {
  const existing = await prisma.newsArticle.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    return res.status(404).json({ success: false, error: 'Article not found' });
  }

  const data = parseNewsFields(req.body);

  if (req.file) {
    await createMediaRecord(req.file, 'news', req.user.id);
    data.imageUrl = buildStoredImagePath('news', req.file.filename);

    if (existing.imageUrl?.startsWith('/uploads/')) {
      removeStoredFile(existing.imageUrl);
    }
  }

  const article = await prisma.newsArticle.update({
    where: { id: req.params.id },
    data,
  });

  res.status(200).json({ success: true, data: article });
});

const deleteNewsArticle = asyncHandler(async (req, res) => {
  const existing = await prisma.newsArticle.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    return res.status(404).json({ success: false, error: 'Article not found' });
  }

  await prisma.newsArticle.delete({ where: { id: req.params.id } });

  if (existing.imageUrl?.startsWith('/uploads/')) {
    removeStoredFile(existing.imageUrl);
  }

  res.status(200).json({ success: true, message: 'Article deleted' });
});

module.exports = {
  getNewsArticles,
  getNewsBySlug,
  createNewsArticle,
  updateNewsArticle,
  deleteNewsArticle,
};
