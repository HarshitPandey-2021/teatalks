const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  try {
    let token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ msg: 'No token, access denied' });
    }

    token = token.split(' ')[1]; // Bearer TOKEN

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded.id;

    next(); // move to next step
  } catch (error) {
    res.status(401).json({ msg: 'Invalid token' });
  }
};

module.exports = protect;