require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const {
  GALLERY_IMAGES,
  PROGRAMS,
  NEWS_ARTICLES,
  copyAllContentAssets,
  uploadUrl,
} = require('./contentAssets');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set. Add it to BACKEND/.env before importing content assets.');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function importGallery() {
  for (let i = 0; i < GALLERY_IMAGES.length; i++) {
    const image = GALLERY_IMAGES[i];
    const url = uploadUrl('gallery', image.file);

    await prisma.galleryImage.upsert({
      where: { publicId: image.publicId },
      update: {
        title: image.title,
        category: image.category,
        url,
        altText: image.title,
        status: 'published',
        sortOrder: i,
      },
      create: {
        publicId: image.publicId,
        title: image.title,
        category: image.category,
        url,
        altText: image.title,
        status: 'published',
        sortOrder: i,
      },
    });
  }
}

async function importPrograms() {
  for (const programData of PROGRAMS) {
    const program = await prisma.program.findUnique({ where: { slug: programData.slug } });
    if (!program) {
      console.warn(`Program not found, skipping: ${programData.slug}`);
      continue;
    }

    await prisma.program.update({
      where: { id: program.id },
      data: { imageUrl: programData.imageUrl },
    });

    await prisma.programImage.deleteMany({ where: { programId: program.id } });
    if (programData.images.length) {
      await prisma.programImage.createMany({
        data: programData.images.map((url, sortOrder) => ({
          programId: program.id,
          url,
          altText: program.title,
          sortOrder,
        })),
      });
    }
  }
}

async function importNews() {
  for (const articleData of NEWS_ARTICLES) {
    const article = await prisma.newsArticle.findUnique({ where: { slug: articleData.slug } });
    if (!article) {
      console.warn(`News article not found, skipping: ${articleData.slug}`);
      continue;
    }

    await prisma.newsArticle.update({
      where: { id: article.id },
      data: { imageUrl: articleData.imageUrl },
    });
  }
}

async function importSiteImages() {
  await prisma.siteSettings.upsert({
    where: { id: 'site' },
    update: {
      heroImageUrl: '/uploads/general/hero-team.jpg',
      aboutImageUrl: '/uploads/general/gallery-1.jpg',
      getInvolvedImage1Url: '/uploads/general/gallery-1.jpg',
      getInvolvedImage2Url: '/uploads/general/gallery-2.jpg',
      logoImageUrl: '/uploads/general/vmg-logo.jpg',
    },
    create: {
      id: 'site',
      name: 'Vision Mentors Group',
      shortName: 'VMG',
      heroImageUrl: '/uploads/general/hero-team.jpg',
      aboutImageUrl: '/uploads/general/gallery-1.jpg',
      getInvolvedImage1Url: '/uploads/general/gallery-1.jpg',
      getInvolvedImage2Url: '/uploads/general/gallery-2.jpg',
      logoImageUrl: '/uploads/general/vmg-logo.jpg',
    },
  });
}

async function importContent() {
  const { galleryCount, generalCount } = copyAllContentAssets();
  console.log(`Copied ${galleryCount} gallery image(s) and ${generalCount} general asset(s).`);

  await importSiteImages();
  console.log('Updated site page image URLs.');

  await importGallery();
  console.log(`Upserted ${GALLERY_IMAGES.length} gallery record(s).`);

  await importPrograms();
  console.log(`Updated ${PROGRAMS.length} program(s).`);

  await importNews();
  console.log(`Updated ${NEWS_ARTICLES.length} news article(s).`);
}

importContent()
  .catch((error) => {
    console.error('Content import failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
