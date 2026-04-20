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

    // Allow anonymous access when there is no bearer token.
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded.id;
    req.userRole = decoded.role;

    next();
  } catch (error) {
    // Ignore invalid tokens on optional auth routes.
    next();
  }
};

module.exports = protect;
module.exports.optionalProtect = optionalProtect;