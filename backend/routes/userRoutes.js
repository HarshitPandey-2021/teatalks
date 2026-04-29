const express = require('express');
const router = express.Router();
const {
  register,
  requestRegistrationOtp,
  login,
  getMe,
  updateMe,
  getMyPosts,
  getMyActivity,
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  forgotPassword,
  verifyForgotPasswordOtp,
  resetPasswordWithOtp,
} = require('../controllers/userController');
const protect = require('../middleware/authMiddleware');
const detectToxicity = require('../services/toxicityService').detectToxicity;

router.post('/register/request-otp', requestRegistrationOtp);
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/forgot-password/verify-otp', verifyForgotPasswordOtp);
router.post('/forgot-password/reset', resetPasswordWithOtp);
router.get('/me', protect, getMe);
router.patch('/me', protect, updateMe);
router.get('/my-posts', protect, getMyPosts);
router.get('/my-activity', protect, getMyActivity);
router.get('/notifications', protect, getMyNotifications);
router.patch('/notifications/read-all', protect, markAllNotificationsRead);
router.patch('/notifications/:id/read', protect, markNotificationRead);
router.post('/detect-toxicity', protect, async (req, res) => {
  try {
    const text = typeof req.body?.text === 'string' ? req.body.text : '';
    if (!text.trim()) {
      return res.status(400).json({ error: 'text is required' });
    }

    const result = await detectToxicity(text);
    return res.json(result);
  } catch (err) {
    console.error("Toxicity service error", {
      status: err.status,
      code: err.code,
      message: err.message,
      details: err.details
    });

    if (err.message === 'Text is required and must be a string' || err.message === 'Text cannot be empty') {
      return res.status(400).json({ error: err.message });
    }

    if (err.status) {
      return res.status(err.status).json({ error: err.message, details: err.details || null });
    }

    return res.status(500).json({ error: err.message });
  }
});

    
// Protected Route Example
router.get('/profile', protect, (req, res) => {
  res.json({ msg: 'This is protected', userId: req.user });
});

module.exports = router;
