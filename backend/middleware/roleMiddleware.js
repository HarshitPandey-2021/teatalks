const User = require('../models/user');

const requireAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user).select('role');
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    return next();
  } catch (error) {
    return res.status(500).json({ message: 'Unable to verify admin access' });
  }
};

module.exports = {
  requireAdmin,
};
