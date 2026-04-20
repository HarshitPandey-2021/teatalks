const express = require('express');
const protect = require('../middleware/authMiddleware');
const optionalProtect = protect.optionalProtect;
const {
  createPost,
  listPosts,
  getPostById,
  updatePost,
  deletePost,
  votePost,
} = require('../controllers/postController');
const { createComment, listPostComments, createReply } = require('../controllers/commentController');

const router = express.Router();

router.get('/', listPosts);
router.post('/', protect, createPost);
router.get('/:id', getPostById);
router.patch('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);
router.post('/:id/vote', protect, votePost);

router.get('/:id/comments', optionalProtect, listPostComments);
router.post('/:id/comments', protect, createComment);
router.post('/:postId/comments/:parentCommentId/replies', protect, createReply);

module.exports = router;
