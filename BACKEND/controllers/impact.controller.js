const { prisma } = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler.middleware');

const getImpactData = asyncHandler(async (req, res) => {
  const [highlights, outcomes] = await Promise.all([
    prisma.impactHighlight.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.programOutcome.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    }),
  ]);

  res.status(200).json({
    success: true,
    data: { highlights, outcomes },
  });
});

const upsertImpactHighlight = asyncHandler(async (req, res) => {
  const { id, value, label, year, sortOrder, isActive } = req.body;

  const highlight = id
    ? await prisma.impactHighlight.update({
        where: { id },
        data: { value, label, year, sortOrder, isActive },
      })
    : await prisma.impactHighlight.create({
        data: { value, label, year, sortOrder: sortOrder ?? 0, isActive: isActive ?? true },
      });

  res.status(id ? 200 : 201).json({ success: true, data: highlight });
});

const deleteImpactHighlight = asyncHandler(async (req, res) => {
  await prisma.impactHighlight.delete({ where: { id: req.params.id } });
  res.status(200).json({ success: true, message: 'Impact highlight deleted' });
});

const upsertProgramOutcome = asyncHandler(async (req, res) => {
  const { id, program, metric, detail, year, sortOrder, isActive } = req.body;

  const outcome = id
    ? await prisma.programOutcome.update({
        where: { id },
        data: { program, metric, detail, year, sortOrder, isActive },
      })
    : await prisma.programOutcome.create({
        data: {
          program,
          metric,
          detail,
          year,
          sortOrder: sortOrder ?? 0,
          isActive: isActive ?? true,
        },
      });

  res.status(id ? 200 : 201).json({ success: true, data: outcome });
});

const deleteProgramOutcome = asyncHandler(async (req, res) => {
  await prisma.programOutcome.delete({ where: { id: req.params.id } });
  res.status(200).json({ success: true, message: 'Program outcome deleted' });
});

module.exports = {
  getImpactData,
  upsertImpactHighlight,
  deleteImpactHighlight,
  upsertProgramOutcome,
  deleteProgramOutcome,
};
