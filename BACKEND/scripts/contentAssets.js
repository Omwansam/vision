const fs = require('fs');
const path = require('path');

const NGO_PUBLIC_DIR = path.join(__dirname, '../../ngo-website/public');
const NGO_IMAGES_DIR = path.join(NGO_PUBLIC_DIR, 'images');
const UPLOADS_DIR = path.join(__dirname, '../uploads');

const GALLERY_IMAGES = [
  { publicId: 'kids-eating', title: 'Children Sharing Meals', category: 'Early Childhood Development', file: 'kids-eating.jpg' },
  { publicId: 'ecd-mother-child', title: 'Maternal Bonding', category: 'Early Childhood Development', file: 'ecd-mother-child.webp' },
  { publicId: 'ecd-classroom', title: 'Learning in Action', category: 'Early Childhood Development', file: 'ecd-classroom.webp' },
  { publicId: 'maternal-health', title: 'Maternal Health Initiative', category: 'Maternal Health', file: 'maternal-health-initiative.png' },
  { publicId: 'classroom-1', title: 'Building Educational Infrastructure', category: 'Infrastructure Development', file: 'classroom-construction-1.jpg' },
  { publicId: 'classroom-2', title: 'Classroom Construction', category: 'Infrastructure Development', file: 'classroom-construction-2.jpg' },
  { publicId: 'food-relief-1', title: 'Emergency Food Distribution', category: 'Community Resilience', file: 'food-relief-1.jpg' },
  { publicId: 'food-relief-2', title: 'Food Aid Program', category: 'Community Resilience', file: 'food-relief-2.jpg' },
  { publicId: 'flood-relief', title: 'Flood Relief Response', category: 'Emergency Response', file: 'flood-relief.jpg' },
  { publicId: 'organized-relief', title: 'Coordinated Relief Efforts', category: 'Community Resilience', file: 'organized-relief.jpg' },
  { publicId: 'relief-dist', title: 'Community Support Distribution', category: 'Community Resilience', file: 'relief-distribution.jpg' },
  { publicId: 'hunger-relief', title: 'Hunger Relief Initiative', category: 'Community Resilience', file: 'hunger-relief.jpg' },
];

const GENERAL_ASSETS = [
  { source: 'hero-team.jpg', file: 'hero-team.jpg' },
  { source: 'gallery-1.jpg', file: 'gallery-1.jpg' },
  { source: 'gallery-2.jpg', file: 'gallery-2.jpg' },
  { source: 'gallery-3.jpg', file: 'gallery-3.jpg' },
  { source: 'branding/vmg-logo.jpg', file: 'vmg-logo.jpg' },
];

const PROGRAMS = [
  {
    slug: 'ecd',
    imageUrl: '/uploads/gallery/kids-eating.jpg',
    images: [
      '/uploads/gallery/kids-eating.jpg',
      '/uploads/gallery/ecd-mother-child.webp',
      '/uploads/gallery/ecd-classroom.webp',
    ],
  },
  {
    slug: 'maternal-health',
    imageUrl: '/uploads/gallery/maternal-health-initiative.png',
    images: ['/uploads/gallery/maternal-health-initiative.png'],
  },
  {
    slug: 'community-resilience',
    imageUrl: '/uploads/gallery/organized-relief.jpg',
    images: [
      '/uploads/gallery/organized-relief.jpg',
      '/uploads/gallery/flood-relief.jpg',
      '/uploads/gallery/food-relief-2.jpg',
      '/uploads/gallery/relief-distribution.jpg',
      '/uploads/gallery/hunger-relief.jpg',
      '/uploads/gallery/classroom-construction-1.jpg',
      '/uploads/gallery/classroom-construction-2.jpg',
    ],
  },
];

const NEWS_ARTICLES = [
  { slug: 'ecd-centres-2025', imageUrl: '/uploads/gallery/ecd-classroom.webp' },
  { slug: 'maternal-health-drive', imageUrl: '/uploads/gallery/maternal-health-initiative.png' },
  { slug: 'classroom-groundbreaking', imageUrl: '/uploads/gallery/classroom-construction-1.jpg' },
  { slug: 'annual-report-2024', imageUrl: '/uploads/general/gallery-1.jpg' },
];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyAsset(sourcePath, destDir, destFile) {
  const dest = path.join(destDir, destFile);
  if (!fs.existsSync(sourcePath)) {
    console.warn(`Skipping missing source file: ${sourcePath}`);
    return false;
  }
  fs.copyFileSync(sourcePath, dest);
  return true;
}

function uploadUrl(folder, file) {
  return `/uploads/${folder}/${file}`;
}

function copyGalleryAssets() {
  const destDir = path.join(UPLOADS_DIR, 'gallery');
  ensureDir(destDir);

  let copied = 0;
  for (const image of GALLERY_IMAGES) {
    if (copyAsset(path.join(NGO_IMAGES_DIR, image.file), destDir, image.file)) {
      copied += 1;
    }
  }
  return copied;
}

function copyGeneralAssets() {
  const destDir = path.join(UPLOADS_DIR, 'general');
  ensureDir(destDir);

  let copied = 0;
  for (const asset of GENERAL_ASSETS) {
    if (copyAsset(path.join(NGO_PUBLIC_DIR, asset.source), destDir, asset.file)) {
      copied += 1;
    }
  }
  return copied;
}

function copyAllContentAssets() {
  const galleryCount = copyGalleryAssets();
  const generalCount = copyGeneralAssets();
  return { galleryCount, generalCount };
}

module.exports = {
  GALLERY_IMAGES,
  GENERAL_ASSETS,
  PROGRAMS,
  NEWS_ARTICLES,
  NGO_PUBLIC_DIR,
  NGO_IMAGES_DIR,
  UPLOADS_DIR,
  uploadUrl,
  copyGalleryAssets,
  copyGeneralAssets,
  copyAllContentAssets,
};
