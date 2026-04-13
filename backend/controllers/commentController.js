const Comment = require('../models/comment');
const Post = require('../models/posts');
const User = require('../models/user');
const mongoose = require('mongoose');

exports.createComment = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const { text } = req.body;
    if (!text?.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const user = await User.findById(req.user).select('anonymousName');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const comment = await Comment.create({
      postId: post._id,
      authorId: req.user,
      anonymousName: user.anonymousName,
      text: text.trim(),
    });

    return res.status(201).json({ comment });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.createReply = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.postId) || !mongoose.Types.ObjectId.isValid(req.params.parentCommentId)) {
      return res.status(404).json({ message: 'Post or parent comment not found' });
    }
    const { text } = req.body;
    if (!text?.trim()) {
      return res.status(400).json({ message: 'Reply text is required' });
    }

    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const parentComment = await Comment.findById(req.params.parentCommentId);
    if (!parentComment) return res.status(404).json({ message: 'Parent comment not found' });

    const user = await User.findById(req.user).select('anonymousName');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const comment = await Comment.create({
      postId: post._id,
      authorId: req.user,
      anonymousName: user.anonymousName,
      text: text.trim(),
      parentCommentId: parentComment._id,
    });

    return res.status(201).json({ comment });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.listPostComments = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.json({ comments: [] });
    }
    const comments = await Comment.find({ postId: req.params.id }).sort({ createdAt: 1 });
    return res.json({ comments });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateComment = async (req, res) => {
  try {
    const { text } = req.body;
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (String(comment.authorId) !== req.user) {
      return res.status(403).json({ message: 'Not allowed to edit this comment' });
    }
    if (!text?.trim()) return res.status(400).json({ message: 'Comment text is required' });

    comment.text = text.trim();
    await comment.save();
    return res.json({ comment });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (String(comment.authorId) !== req.user && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Not allowed to delete this comment' });
    }

    await Comment.deleteMany({ parentCommentId: comment._id });
    await Comment.deleteOne({ _id: comment._id });
    return res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.voteComment = async (req, res) => {
  try {
    const { vote } = req.body;
    if (![1, -1].includes(vote)) {
      return res.status(400).json({ message: 'vote must be 1 or -1' });
    }

    const comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { $inc: { votes: vote } },
      { new: true }
    );
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    return res.json({ comment });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
