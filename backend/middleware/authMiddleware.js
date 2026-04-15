const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  try {
    let token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ message: 'No token, access denied' });
    }

    token = token.split(' ')[1]; // Bearer TOKEN

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded.id;
    req.userRole = decoded.role;

    next(); // move to next step
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

const optionalProtect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.id;
    req.userRole = decoded.role;
  } catch (error) {
    // Ignore invalid optional auth and continue as guest.
  }

  next();
};

module.exports = protect;
module.exports.optionalProtect = optionalProtect;
