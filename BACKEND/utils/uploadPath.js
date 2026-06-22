const path = require('path');

const ALLOWED_UPLOAD_FOLDERS = ['gallery', 'news', 'programs', 'general'];

function buildStoredImagePath(folder, filename) {
  if (!filename) return null;
  const normalized = filename.split(path.sep).join('/');
  return `/uploads/${folder}/${normalized}`;
}

function getUploadDir(folder) {
  return path.join(__dirname, '..', 'uploads', folder);
}

function resolveUploadDiskPath(publicUrl) {
  if (!publicUrl?.startsWith('/uploads/')) return null;
  return path.join(__dirname, '..', publicUrl.replace(/^\//, ''));
}

module.exports = {
  ALLOWED_UPLOAD_FOLDERS,
  buildStoredImagePath,
  getUploadDir,
  resolveUploadDiskPath,
};
