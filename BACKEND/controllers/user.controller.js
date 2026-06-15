const bcrypt = require('bcryptjs');
const { prisma } = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler.middleware');
const { STAFF_ROLES } = require('../middleware/authorize.middleware');

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  dob: true,
  country: true,
  idType: true,
  idNumber: true,
  isActive: true,
  lastLogin: true,
  createdAt: true,
  updatedAt: true,
};

const adminUserListSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
  lastLogin: true,
};

function mapIdType(idType) {
  if (idType === null || idType === undefined || idType === '') return null;
  if (idType === 'national-id') return 'national_id';
  if (idType === 'drivers-license') return 'drivers_license';
  return idType;
}

const getProfile = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: publicUserSelect,
  });

  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  res.status(200).json({ success: true, data: user });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, country, dob, idType, idNumber } = req.body;
  const data = {};

  if (name !== undefined && name !== null) {
    if (typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Name is required' });
    }
    data.name = name.trim();
  }
  if (country !== undefined) data.country = country === '' ? null : country;
  if (idNumber !== undefined) data.idNumber = idNumber === '' ? null : idNumber;

  if (idType !== undefined) {
    data.idType = idType === '' || idType === null ? null : mapIdType(idType);
  }

  if (dob !== undefined) {
    data.dob = dob === '' || dob === null ? null : new Date(dob);
  }

  if (Object.keys(data).length === 0) {
    return res.status(400).json({ success: false, error: 'No profile fields to update' });
  }

  const updatedUser = await prisma.user.update({
    where: { id: req.user.id },
    data,
    select: publicUserSelect,
  });

  res.status(200).json({ success: true, data: updatedUser });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      error: 'Please provide both current and new passwords',
    });
  }

  if (typeof newPassword !== 'string' || newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      error: 'New password must be at least 6 characters',
    });
  }

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return res.status(401).json({ success: false, error: 'Incorrect current password' });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  res.status(200).json({ success: true, message: 'Password updated successfully' });
});

const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, dob, country, idType, idNumber } = req.body;

  if (!name?.trim() || !email?.trim() || !password) {
    return res.status(400).json({
      success: false,
      error: 'Name, email and password are required',
    });
  }

  if (!STAFF_ROLES.includes(role)) {
    return res.status(400).json({
      success: false,
      error: `Role must be one of: ${STAFF_ROLES.join(', ')}`,
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existingUser) {
    return res.status(409).json({ success: false, error: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role,
      dob: dob ? new Date(dob) : null,
      country: country || null,
      idType: mapIdType(idType),
      idNumber: idNumber || null,
    },
    select: adminUserListSelect,
  });

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: user,
  });
});

const getAllUsers = asyncHandler(async (req, res) => {
  const { role, isActive } = req.query;
  const where = {};

  if (role) where.role = role;
  if (isActive !== undefined) where.isActive = isActive === 'true';

  const users = await prisma.user.findMany({
    where,
    select: adminUserListSelect,
    orderBy: { createdAt: 'desc' },
  });

  res.status(200).json({ success: true, count: users.length, data: users });
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: publicUserSelect,
  });

  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  res.status(200).json({ success: true, data: user });
});

const updateUser = asyncHandler(async (req, res) => {
  const { name, email, role, isActive, country, dob, idType, idNumber } = req.body;
  const data = {};

  if (name !== undefined) data.name = name.trim();
  if (email !== undefined) data.email = email.trim().toLowerCase();
  if (country !== undefined) data.country = country || null;
  if (idNumber !== undefined) data.idNumber = idNumber || null;
  if (dob !== undefined) data.dob = dob ? new Date(dob) : null;
  if (idType !== undefined) data.idType = mapIdType(idType);
  if (isActive !== undefined) data.isActive = Boolean(isActive);

  if (role !== undefined) {
    if (!STAFF_ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        error: `Role must be one of: ${STAFF_ROLES.join(', ')}`,
      });
    }
    data.role = role;
  }

  if (Object.keys(data).length === 0) {
    return res.status(400).json({ success: false, error: 'No fields to update' });
  }

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data,
    select: publicUserSelect,
  });

  res.status(200).json({ success: true, data: user });
});

const deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.user.id) {
    return res.status(400).json({ success: false, error: 'You cannot delete your own account' });
  }

  await prisma.user.delete({ where: { id: req.params.id } });
  res.status(200).json({ success: true, message: 'User deleted' });
});

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
