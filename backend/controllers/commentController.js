const Comment = require('../models/comment');
const Post = require('../models/posts');
const User = require('../models/user');
const CommentVote = require('../models/commentVote');
const Report = require('../models/reports');
const mongoose = require('mongoose');
const { buildToxicityModeration } = require('../services/contentModerationService');
const { createNotification, notifyAdmins, trimMessage } = require('../services/notificationService');
const { validateCommentText } = require('../utils/validation');

async function serializeComment(commentDoc, viewerUserId = null) {
  const comment = commentDoc.toObject ? commentDoc.toObject() : commentDoc;
  let userVote = null;

  if (viewerUserId) {
    const voteDoc = await CommentVote.findOne({ commentId: comment._id, userId: viewerUserId }).select('value');
    if (voteDoc?.value === 1) userVote = 'up';
    if (voteDoc?.value === -1) userVote = 'down';
  }

  return {
    ...comment,
    anonymousEmoji: comment.anonymousEmoji || '🙂',
    score: Number(comment.votes || 0),
    userVote,
  };
}

exports.createComment = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const { text } = req.body;
    const textError = validateCommentText(text, 'Comment');
    if (textError) {
      return res.status(400).json({ message: textError });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const user = await User.findById(req.user).select('anonymousName emoji');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { toxicity, moderationFields } = await buildToxicityModeration(text.trim());

    const comment = await Comment.create({
      postId: post._id,
      authorId: req.user,
      anonymousName: user.anonymousName,
      anonymousEmoji: user.emoji,
      text: text.trim(),
      ...moderationFields,
    });

    if (moderationFields?.adminReviewStatus === 'pending') {
      await notifyAdmins({
        type: 'admin_toxic_comment',
        title: 'Toxic comment needs review',
        message: trimMessage(text || 'A comment was flagged by safety checks.', 120),
        href: '/admin/flagged',
        metadata: {
          targetType: 'Comment',
          targetId: comment._id,
          postId: post._id,
          moderationStatus: comment.moderationStatus,
        },
      });
    }

    if (String(post.authorId) !== String(req.user)) {
      await createNotification({
        recipientId: post.authorId,
        type: 'post_comment',
        title: 'New comment on your post',
        message: `${user.anonymousName} replied: ${trimMessage(text, 140)}`,
        href: `/posts/${post._id}`,
        metadata: {
          postId: post._id,
          commentId: comment._id,
        },
      });
    }

    return res.status(201).json({ comment: await serializeComment(comment, req.user), toxicity });
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
    const textError = validateCommentText(text, 'Reply');
    if (textError) {
      return res.status(400).json({ message: textError });
    }

    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const parentComment = await Comment.findById(req.params.parentCommentId);
    if (!parentComment) return res.status(404).json({ message: 'Parent comment not found' });

    const user = await User.findById(req.user).select('anonymousName emoji');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { toxicity, moderationFields } = await buildToxicityModeration(text.trim());

    const comment = await Comment.create({
      postId: post._id,
      authorId: req.user,
      anonymousName: user.anonymousName,
      anonymousEmoji: user.emoji,
      text: text.trim(),
      parentCommentId: parentComment._id,
      ...moderationFields,
    });

    if (moderationFields?.adminReviewStatus === 'pending') {
      await notifyAdmins({
        type: 'admin_toxic_comment',
        title: 'Toxic reply needs review',
        message: trimMessage(text || 'A reply was flagged by safety checks.', 120),
        href: '/admin/flagged',
        metadata: {
          targetType: 'Comment',
          targetId: comment._id,
          postId: post._id,
          moderationStatus: comment.moderationStatus,
        },
      });
    }

    if (String(parentComment.authorId) !== String(req.user)) {
      await createNotification({
        recipientId: parentComment.authorId,
        type: 'comment_reply',
        title: 'New reply to your comment',
        message: `${user.anonymousName} replied: ${trimMessage(text, 140)}`,
        href: `/posts/${post._id}`,
        metadata: {
          postId: post._id,
          commentId: parentComment._id,
          replyId: comment._id,
        },
      });
    }

    return res.status(201).json({ comment: await serializeComment(comment, req.user), toxicity });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.listPostComments = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.json({ comments: [] });
    }
    const query = { postId: req.params.id };
    if (req.userRole !== 'admin') {
      query.$or = [
        { visibility: 'visible' },
        { visibility: { $exists: false } },
        { visibility: null },
      ];
    }
    const comments = await Comment.find(query).sort({ createdAt: 1 });
    const serializedComments = await Promise.all(comments.map((comment) => serializeComment(comment, req.user)));
    return res.json({ comments: serializedComments });
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
    const textError = validateCommentText(text, 'Comment');
    if (textError) return res.status(400).json({ message: textError });

    comment.text = text.trim();
    const { toxicity, moderationFields } = await buildToxicityModeration(comment.text);
    Object.assign(comment, moderationFields);
    await comment.save();
    if (moderationFields?.adminReviewStatus === 'pending') {
      await notifyAdmins({
        type: 'admin_toxic_comment',
        title: 'Edited comment needs review',
        message: trimMessage(comment.text || 'A comment was flagged by safety checks.', 120),
        href: '/admin/flagged',
        metadata: {
          targetType: 'Comment',
          targetId: comment._id,
          postId: comment.postId,
          moderationStatus: comment.moderationStatus,
        },
      });
    }
    return res.json({ comment: await serializeComment(comment, req.user), toxicity });
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

    const commentsToDelete = await Comment.find({
      $or: [{ _id: comment._id }, { parentCommentId: comment._id }],
    }).select('_id');
    const commentIds = commentsToDelete.map((item) => item._id);

    await Comment.deleteMany({ _id: { $in: commentIds } });
    await CommentVote.deleteMany({ commentId: { $in: commentIds } });
    await Report.deleteMany({ targetId: { $in: commentIds }, targetType: 'Comment' });
    return res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.voteComment = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    const { vote } = req.body;
    if (![1, -1, 0].includes(vote)) {
      return res.status(400).json({ message: 'vote must be 1, -1, or 0' });
    }

    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    const existingVote = await CommentVote.findOne({ commentId: comment._id, userId: req.user });
    const previousValue = existingVote?.value || 0;
    const nextValue = vote;
    const delta = nextValue - previousValue;

    if (nextValue === 0) {
      if (existingVote) await CommentVote.deleteOne({ _id: existingVote._id });
    } else if (existingVote) {
      existingVote.value = nextValue;
      await existingVote.save();
    } else {
      await CommentVote.create({ commentId: comment._id, userId: req.user, value: nextValue });
    }

    if (delta !== 0) {
      comment.votes = Number(comment.votes || 0) + delta;
      await comment.save();
    }

    return res.json({ comment: await serializeComment(comment, req.user) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
