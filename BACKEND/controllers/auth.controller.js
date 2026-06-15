const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
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

const secret = config.JWT_SECRET;
const expiresIn = config.JWT_EXPIRES_IN;

function jwtExpiresToMs(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value * 24 * 60 * 60 * 1000;
  }
  const s = String(value || '').trim();
  const m = /^(\d+)(s|m|h|d)$/i.exec(s);
  if (!m) return 7 * 24 * 60 * 60 * 1000;
  const n = parseInt(m[1], 10);
  const u = m[2].toLowerCase();
  const mult = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 };
  return n * mult[u];
}

function formatUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

const sendTokenResponse = (user, statusCode, res, message) => {
  if (!secret) {
    return res.status(500).json({
      success: false,
      error: 'Server misconfiguration: JWT_SECRET is not set',
    });
  }

  const token = jwt.sign({ id: user.id }, secret, { expiresIn });

  const options = {
    maxAge: jwtExpiresToMs(expiresIn),
    httpOnly: true,
  };

  if (config.NODE_ENV === 'production') {
    options.secure = true;
  }

  return res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      message,
      user: formatUser(user),
    });
};

const loginUser = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email and password are required',
    });
  }

  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });

  if (!user || !user.isActive) {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials',
    });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials',
    });
  }

  if (role && user.role !== role) {
    return res.status(403).json({
      success: false,
      error: 'Unauthorized role access',
    });
  }

  if (!STAFF_ROLES.includes(user.role)) {
    return res.status(403).json({
      success: false,
      error: 'Staff access only',
    });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  return sendTokenResponse(user, 200, res, 'Logged in successfully');
});

const getMe = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: publicUserSelect,
  });

  res.status(200).json({ success: true, user });
});

const logoutUser = asyncHandler(async (req, res) => {
  res
    .cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    })
    .status(200)
    .json({
      success: true,
      message: 'Logged out successfully',
    });
});

module.exports = {
  loginUser,
  logoutUser,
  getMe,
  sendTokenResponse,
};
