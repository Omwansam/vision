const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { ALLOWED_UPLOAD_FOLDERS, getUploadDir } = require('../utils/uploadPath');

function ensureUploadDir(folder) {
  const uploadDir = getUploadDir(folder);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  return uploadDir;
}

function createImageUpload(folder = 'gallery') {
  ensureUploadDir(folder);

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, ensureUploadDir(folder));
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `image-${uniqueSuffix}${ext}`);
    },
  });

  const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetypes = /image\/jpeg|image\/jpg|image\/png|image\/gif|image\/webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = mimetypes.test(file.mimetype);

    if (mimetype && extname) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (JPEG, PNG, GIF, WebP)'));
    }
  };

  return multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter,
  });
}

const galleryUpload = createImageUpload('gallery');

function uploadFolderGuard(req, res, next) {
  const folder = req.params.folder;
  if (!ALLOWED_UPLOAD_FOLDERS.includes(folder)) {
    return res.status(400).json({ success: false, error: 'Invalid upload folder' });
  }
  req.uploadFolder = folder;
  next();
}

function dynamicImageUpload(req, res, next) {
  const folder = req.params.folder || 'gallery';
  if (!ALLOWED_UPLOAD_FOLDERS.includes(folder)) {
    return res.status(400).json({ success: false, error: 'Invalid upload folder' });
  }
  req.uploadFolder = folder;
  return createImageUpload(folder).single('image')(req, res, next);
}

const newsUpload = createImageUpload('news');
const programsUpload = createImageUpload('programs');
const generalUpload = createImageUpload('general');

const siteImagesUpload = generalUpload.fields([
  { name: 'heroImage', maxCount: 1 },
  { name: 'aboutImage', maxCount: 1 },
  { name: 'getInvolvedImage1', maxCount: 1 },
  { name: 'getInvolvedImage2', maxCount: 1 },
  { name: 'logoImage', maxCount: 1 },
]);

module.exports = {
  galleryUpload,
  newsUpload,
  programsUpload,
  generalUpload,
  siteImagesUpload,
  createImageUpload,
  uploadFolderGuard,
  dynamicImageUpload,
};
