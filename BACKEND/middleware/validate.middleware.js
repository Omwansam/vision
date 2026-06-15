const validate = (requiredFields = []) => (req, res, next) => {
  const missing = requiredFields.filter((field) => {
    const value = req.body[field];
    if (value === undefined || value === null) return true;
    if (typeof value === 'string' && !value.trim()) return true;
    return false;
  });

  if (missing.length > 0) {
    return res.status(400).json({
      success: false,
      error: `Missing required fields: ${missing.join(', ')}`,
    });
  }

  next();
};

module.exports = validate;
