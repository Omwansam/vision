const { prisma } = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler.middleware');

const programInclude = {
  stats: { orderBy: { sortOrder: 'asc' } },
  images: { orderBy: { sortOrder: 'asc' } },
};

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
  const { slug, title, description, imageUrl, iconName, status, sortOrder, stats, images } = req.body;

  const program = await prisma.program.create({
    data: {
      slug,
      title,
      description,
      imageUrl,
      iconName,
      status: status || 'draft',
      sortOrder: sortOrder ?? 0,
      createdById: req.user.id,
      updatedById: req.user.id,
      stats: stats?.length
        ? { create: stats.map((stat, index) => ({
            label: stat.label || stat,
            value: stat.value || stat,
            sortOrder: stat.sortOrder ?? index,
          })) }
        : undefined,
      images: images?.length
        ? { create: images.map((img, index) => ({
            url: typeof img === 'string' ? img : img.url,
            altText: typeof img === 'string' ? title : img.altText,
            sortOrder: index,
          })) }
        : undefined,
    },
    include: programInclude,
  });

  res.status(201).json({ success: true, data: program });
});

const updateProgram = asyncHandler(async (req, res) => {
  const { stats, images, ...fields } = req.body;

  const program = await prisma.program.update({
    where: { id: req.params.id },
    data: {
      ...fields,
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
  await prisma.program.delete({ where: { id: req.params.id } });
  res.status(200).json({ success: true, message: 'Program deleted' });
});

module.exports = {
  getPrograms,
  getProgramBySlug,
  createProgram,
  updateProgram,
  deleteProgram,
};
