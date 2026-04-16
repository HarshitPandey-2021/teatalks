const express = require('express');
const router = express.Router();
const { register, login, getMe, getMyPosts } = require('../controllers/userController');
const protect = require('../middleware/authMiddleware');
const detectToxicity = require('../services/toxicityService').detectToxicity;

router.post('/register', register);
router.post('/login', login);
router.post('/detect-toxicity', async (req, res) => {
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