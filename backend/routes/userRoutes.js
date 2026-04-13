const express = require('express');
const router = express.Router();
const { register, login, getMe, getMyPosts } = require('../controllers/userController');
const protect = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);

router.get('/profile', protect, getMe);
router.get('/me', protect, getMe);
router.get('/my-posts', protect, getMyPosts);

module.exports = router;