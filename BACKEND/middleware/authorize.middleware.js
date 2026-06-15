const STAFF_ROLES = ['admin', 'editor', 'procurement', 'finance'];
const CONTENT_ROLES = ['admin', 'editor'];
const PROCUREMENT_ROLES = ['admin', 'procurement'];
const FINANCE_ROLES = ['admin', 'finance'];

const authorize = (...allowedRoles) => (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Role '${req.user.role}' is not permitted`,
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authorize;
module.exports.STAFF_ROLES = STAFF_ROLES;
module.exports.CONTENT_ROLES = CONTENT_ROLES;
module.exports.PROCUREMENT_ROLES = PROCUREMENT_ROLES;
module.exports.FINANCE_ROLES = FINANCE_ROLES;
