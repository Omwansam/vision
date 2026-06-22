const { prisma } = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler.middleware');
const { buildStoredImagePath } = require('../utils/uploadPath');
const { createMediaRecord, removeStoredFile } = require('./upload.controller');

function parseJsonField(value, fallback = undefined) {
  if (value === undefined || value === null || value === '') return fallback;
  if (Array.isArray(value)) return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function applySiteImageField(data, body, files, fieldName, fileKey, existingUrl) {
  const file = files?.[fileKey]?.[0];
  const urlsToRemove = [];

  if (file) {
    data[fieldName] = buildStoredImagePath('general', file.filename);
    if (existingUrl?.startsWith('/uploads/')) urlsToRemove.push(existingUrl);
    return { file, urlsToRemove };
  }

  if (body[fieldName] !== undefined) {
    const next = typeof body[fieldName] === 'string' ? body[fieldName].trim() : body[fieldName];
    data[fieldName] = next || null;
    if (!next && existingUrl?.startsWith('/uploads/')) {
      urlsToRemove.push(existingUrl);
    }
  }

  return { file: null, urlsToRemove };
}

const getSiteSettings = asyncHandler(async (req, res) => {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: 'site' },
    include: {
      socialLinks: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
  });

  if (!settings) {
    return res.status(404).json({ success: false, error: 'Site settings not found' });
  }

  res.status(200).json({ success: true, data: settings });
});

const updateSiteSettings = asyncHandler(async (req, res) => {
  const body = req.body;
  const existing = await prisma.siteSettings.findUnique({ where: { id: 'site' } });

  const data = {};
  const scalarFields = [
    'name',
    'shortName',
    'tagline',
    'description',
    'email',
    'tendersEmail',
    'phone',
    'addressLine1',
    'addressLine2',
    'officeHours',
    'mission',
    'vision',
  ];

  for (const field of scalarFields) {
    if (body[field] !== undefined) data[field] = body[field];
  }

  const parsedSocialLinks = parseJsonField(body.socialLinks, body.socialLinks);
  const filesToRemove = [];
  const uploadedFiles = [];

  const imageFields = [
    ['heroImageUrl', 'heroImage'],
    ['aboutImageUrl', 'aboutImage'],
    ['getInvolvedImage1Url', 'getInvolvedImage1'],
    ['getInvolvedImage2Url', 'getInvolvedImage2'],
    ['logoImageUrl', 'logoImage'],
  ];

  for (const [fieldName, fileKey] of imageFields) {
    const result = applySiteImageField(
      data,
      body,
      req.files,
      fieldName,
      fileKey,
      existing?.[fieldName],
    );
    if (result.file) uploadedFiles.push(result.file);
    filesToRemove.push(...result.urlsToRemove);
  }

  await prisma.siteSettings.upsert({
    where: { id: 'site' },
    update: data,
    create: { id: 'site', ...data },
  });

  if (req.user) {
    for (const file of uploadedFiles) {
      await createMediaRecord(file, 'general', req.user.id);
    }
  }

  for (const url of filesToRemove) {
    removeStoredFile(url);
  }

  if (Array.isArray(parsedSocialLinks)) {
    await prisma.socialLink.deleteMany({ where: { siteSettingsId: 'site' } });
    if (parsedSocialLinks.length > 0) {
      await prisma.socialLink.createMany({
        data: parsedSocialLinks.map((link, index) => ({
          siteSettingsId: 'site',
          label: link.label,
          href: link.href,
          sortOrder: link.sortOrder ?? index,
          isActive: link.isActive ?? true,
        })),
      });
    }
  }

  const updated = await prisma.siteSettings.findUnique({
    where: { id: 'site' },
    include: { socialLinks: { orderBy: { sortOrder: 'asc' } } },
  });

  res.status(200).json({ success: true, data: updated });
});

module.exports = { getSiteSettings, updateSiteSettings };
