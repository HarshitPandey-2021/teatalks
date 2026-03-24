const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/userController');
const protect = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);

// Protected Route Example
router.get('/profile', protect, (req, res) => {
  res.json({ msg: 'This is protected', userId: req.user });
});

module.exports = router;