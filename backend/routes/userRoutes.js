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
router.post('/detect-toxicity', protect, async (req, res) => {
 try {
    const result = await detectToxicity(req.body.text);
    res.json(result);
  } catch (err) {
    console.error("Toxicity service error", {
      status: err.status,
      message: err.message,
      details: err.details
    });
    res.status(500).json({ error: err.message });
  }
});

    
// Protected Route Example
router.get('/profile', protect, (req, res) => {
  res.json({ msg: 'This is protected', userId: req.user });
});

module.exports = router;
