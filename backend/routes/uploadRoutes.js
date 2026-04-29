const express = require('express');
const protect = require('../middleware/authMiddleware');
const { getImageSignature } = require('../controllers/uploadController');

const router = express.Router();

router.post('/image-signature', protect, getImageSignature);

module.exports = router;
