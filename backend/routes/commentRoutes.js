const express = require('express');
const protect = require('../middleware/authMiddleware');
const { updateComment, deleteComment, voteComment } = require('../controllers/commentController');

const router = express.Router();

router.patch('/:id', protect, updateComment);
router.delete('/:id', protect, deleteComment);
router.post('/:id/vote', protect, voteComment);

module.exports = router;
