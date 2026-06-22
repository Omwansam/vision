const fs = require('fs');
const { prisma } = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler.middleware');
const { buildStoredImagePath, resolveUploadDiskPath } = require('../utils/uploadPath');

async function createMediaRecord(file, folder, userId) {
  const url = buildStoredImagePath(folder, file.filename);

  return prisma.media.create({
    data: {
      filename: file.filename,
      originalName: file.originalname,
      url,
      mimeType: file.mimetype,
      fileSize: file.size,
      type: 'image',
      uploadedById: userId,
    },
  });
}

const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No image file uploaded' });
  }

  const folder = req.uploadFolder || 'gallery';
  const media = await createMediaRecord(req.file, folder, req.user.id);

  res.status(201).json({
    success: true,
    data: {
      url: media.url,
      mediaId: media.id,
      filename: media.filename,
      originalName: media.originalName,
    },
  });
});

function removeStoredFile(publicUrl) {
  const diskPath = resolveUploadDiskPath(publicUrl);
  if (!diskPath) return;

  fs.unlink(diskPath, (err) => {
    if (err && err.code !== 'ENOENT') {
      console.error('[upload] failed to delete file:', diskPath, err.message);
    }
  });
}

module.exports = {
  uploadImage,
  createMediaRecord,
  removeStoredFile,
};
