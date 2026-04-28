const jwt = require('jsonwebtoken');
const User = require('../models/user');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token, access denied' });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('role banStatus');
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (user.banStatus) {
      return res.status(403).json({ message: 'User is banned' });
    }

    req.user = String(user._id);
    req.userRole = user.role;

    next(); // move to next step
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

const optionalProtect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Allow anonymous access when there is no bearer token.
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('role banStatus');
    if (!user || user.banStatus) {
      return next();
    }

    req.user = String(user._id);
    req.userRole = user.role;

    next();
  } catch (error) {
    // Ignore invalid tokens on optional auth routes.
    next();
  }
};

module.exports = protect;
module.exports.optionalProtect = optionalProtect;
