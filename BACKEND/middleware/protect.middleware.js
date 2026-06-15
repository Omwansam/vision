const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { prisma } = require('../config/db');

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

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token || token === 'none') {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: No token provided',
      });
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: publicUserSelect,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: User not found',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: 'Account is deactivated. Contact an administrator.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Token expired. Please log in again',
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Invalid token',
      });
    }

    next(error);
  }
};

module.exports = protect;
