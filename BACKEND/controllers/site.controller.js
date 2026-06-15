const { prisma } = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler.middleware');

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
  const {
    name,
    shortName,
    tagline,
    description,
    email,
    tendersEmail,
    phone,
    addressLine1,
    addressLine2,
    officeHours,
    mission,
    vision,
    socialLinks,
  } = req.body;

  const data = {};
  if (name !== undefined) data.name = name;
  if (shortName !== undefined) data.shortName = shortName;
  if (tagline !== undefined) data.tagline = tagline;
  if (description !== undefined) data.description = description;
  if (email !== undefined) data.email = email;
  if (tendersEmail !== undefined) data.tendersEmail = tendersEmail;
  if (phone !== undefined) data.phone = phone;
  if (addressLine1 !== undefined) data.addressLine1 = addressLine1;
  if (addressLine2 !== undefined) data.addressLine2 = addressLine2;
  if (officeHours !== undefined) data.officeHours = officeHours;
  if (mission !== undefined) data.mission = mission;
  if (vision !== undefined) data.vision = vision;

  const settings = await prisma.siteSettings.upsert({
    where: { id: 'site' },
    update: data,
    create: { id: 'site', ...data },
    include: { socialLinks: { orderBy: { sortOrder: 'asc' } } },
  });

  if (Array.isArray(socialLinks)) {
    await prisma.socialLink.deleteMany({ where: { siteSettingsId: 'site' } });
    if (socialLinks.length > 0) {
      await prisma.socialLink.createMany({
        data: socialLinks.map((link, index) => ({
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
