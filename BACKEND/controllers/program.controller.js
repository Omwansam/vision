const { prisma } = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler.middleware');
const { buildStoredImagePath } = require('../utils/uploadPath');
const { parseIntField } = require('../utils/parseFormValue');
const { createMediaRecord, removeStoredFile } = require('./upload.controller');

const programInclude = {
  stats: { orderBy: { sortOrder: 'asc' } },
  images: { orderBy: { sortOrder: 'asc' } },
};

function parseProgramFields(body) {
  const data = {};

  if (body.slug !== undefined) data.slug = body.slug.trim();
  if (body.title !== undefined) data.title = body.title.trim();
  if (body.description !== undefined) data.description = body.description;
  if (body.imageUrl !== undefined) data.imageUrl = body.imageUrl?.trim() || null;
  if (body.iconName !== undefined) data.iconName = body.iconName;
  if (body.status !== undefined) data.status = body.status;

  const sortOrder = parseIntField(body.sortOrder);
  if (sortOrder !== undefined) data.sortOrder = sortOrder;

  return data;
}

function parseJsonField(value, fallback = undefined) {
  if (value === undefined || value === null || value === '') return fallback;
  if (Array.isArray(value)) return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

const getPrograms = asyncHandler(async (req, res) => {
  const where = req.user ? {} : { status: 'published' };

  const programs = await prisma.program.findMany({
    where,
    include: programInclude,
    orderBy: { sortOrder: 'asc' },
  });

  res.status(200).json({ success: true, count: programs.length, data: programs });
});

const getProgramBySlug = asyncHandler(async (req, res) => {
  const where = { slug: req.params.slug };
  if (!req.user) where.status = 'published';

  const program = await prisma.program.findFirst({
    where,
    include: programInclude,
  });

  if (!program) {
    return res.status(404).json({ success: false, error: 'Program not found' });
  }

  res.status(200).json({ success: true, data: program });
});

const createProgram = asyncHandler(async (req, res) => {
  const data = parseProgramFields(req.body);
  const stats = parseJsonField(req.body.stats);
  const images = parseJsonField(req.body.images);

  if (req.file) {
    await createMediaRecord(req.file, 'programs', req.user.id);
    data.imageUrl = buildStoredImagePath('programs', req.file.filename);
  }

  if (!data.slug || !data.title || !data.description) {
    return res.status(400).json({ success: false, error: 'slug, title, and description are required' });
  }

  const program = await prisma.program.create({
    data: {
      slug: data.slug,
      title: data.title,
      description: data.description,
      imageUrl: data.imageUrl,
      iconName: data.iconName,
      status: data.status || 'draft',
      sortOrder: data.sortOrder ?? 0,
      createdById: req.user.id,
      updatedById: req.user.id,
      stats: stats?.length
        ? {
            create: stats.map((stat, index) => ({
              label: stat.label || stat,
              value: stat.value || stat,
              sortOrder: stat.sortOrder ?? index,
            })),
          }
        : undefined,
      images: images?.length
        ? {
            create: images.map((img, index) => ({
              url: typeof img === 'string' ? img : img.url,
              altText: typeof img === 'string' ? data.title : img.altText,
              sortOrder: index,
            })),
          }
        : undefined,
    },
    include: programInclude,
  });

  res.status(201).json({ success: true, data: program });
});

const updateProgram = asyncHandler(async (req, res) => {
  const existing = await prisma.program.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    return res.status(404).json({ success: false, error: 'Program not found' });
  }

  const data = parseProgramFields(req.body);
  const stats = parseJsonField(req.body.stats);
  const images = parseJsonField(req.body.images);

  if (req.file) {
    await createMediaRecord(req.file, 'programs', req.user.id);
    data.imageUrl = buildStoredImagePath('programs', req.file.filename);

    if (existing.imageUrl?.startsWith('/uploads/')) {
      removeStoredFile(existing.imageUrl);
    }
  }

  const program = await prisma.program.update({
    where: { id: req.params.id },
    data: {
      ...data,
      updatedById: req.user.id,
    },
    include: programInclude,
  });

  if (Array.isArray(stats)) {
    await prisma.programStat.deleteMany({ where: { programId: program.id } });
    if (stats.length) {
      await prisma.programStat.createMany({
        data: stats.map((stat, index) => ({
          programId: program.id,
          label: stat.label || stat,
          value: stat.value || stat,
          sortOrder: stat.sortOrder ?? index,
        })),
      });
    }
  }

  if (Array.isArray(images)) {
    await prisma.programImage.deleteMany({ where: { programId: program.id } });
    if (images.length) {
      await prisma.programImage.createMany({
        data: images.map((img, index) => ({
          programId: program.id,
          url: typeof img === 'string' ? img : img.url,
          altText: typeof img === 'string' ? program.title : img.altText,
          sortOrder: index,
        })),
      });
    }
  }

  const updated = await prisma.program.findUnique({
    where: { id: program.id },
    include: programInclude,
  });

  res.status(200).json({ success: true, data: updated });
});

const deleteProgram = asyncHandler(async (req, res) => {
  const existing = await prisma.program.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    return res.status(404).json({ success: false, error: 'Program not found' });
  }

  await prisma.program.delete({ where: { id: req.params.id } });

  if (existing.imageUrl?.startsWith('/uploads/')) {
    removeStoredFile(existing.imageUrl);
  }

  res.status(200).json({ success: true, message: 'Program deleted' });
});

module.exports = {
  getPrograms,
  getProgramBySlug,
  createProgram,
  updateProgram,
  deleteProgram,
};
