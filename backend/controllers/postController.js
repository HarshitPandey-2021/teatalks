const Post = require('../models/posts');
const Comment = require('../models/comment');
const User = require('../models/user');
const PostVote = require('../models/postVote');
const CommentVote = require('../models/commentVote');
const Report = require('../models/reports');
const mongoose = require('mongoose');
const {
  buildToxicityModeration,
  buildVoteModerationFields,
} = require('../services/contentModerationService');
const { notifyAdmins, trimMessage } = require('../services/notificationService');
const {
  validatePostCategory,
  validatePoll,
  validatePostText,
  validateTags,
} = require('../utils/validation');

function getPollDurationMs(duration) {
  const hours = parseInt(String(duration).replace(/h$/i, ''), 10);
  return Number.isFinite(hours) ? hours * 60 * 60 * 1000 : 0;
}

function serializePoll(poll, viewerUserId = null) {
  if (!poll || !Array.isArray(poll.options) || poll.options.length < 2) {
    return null;
  }

  const normalizedViewerId = viewerUserId ? String(viewerUserId) : null;
  const voterEntries = Array.isArray(poll.voters) ? poll.voters : [];
  const userVoteEntry = normalizedViewerId
    ? voterEntries.find((entry) => String(entry.userId) === normalizedViewerId)
    : null;

  return {
    options: poll.options.map((option) => option.text),
    votes: poll.options.map((option) => Number(option.votes || 0)),
    totalVotes: poll.options.reduce((sum, option) => sum + Number(option.votes || 0), 0),
    duration: poll.duration || null,
    expiresAt: poll.expiresAt || null,
    isExpired: Boolean(poll.expiresAt && new Date(poll.expiresAt) <= new Date()),
    userVoted: userVoteEntry ? userVoteEntry.optionIndex : null,
  };
}

async function serializePost(postDoc, viewerUserId = null) {
  const post = postDoc.toObject ? postDoc.toObject() : postDoc;
  const commentCount = await Comment.countDocuments({ postId: post._id });
  const safeImageUrl =
    typeof post.image === 'string' && post.image.startsWith('blob:')
      ? null
      : post.image || null;
  let userVote = null;
  if (viewerUserId) {
    const voteDoc = await PostVote.findOne({ postId: post._id, userId: viewerUserId }).select('value');
    if (voteDoc?.value === 1) userVote = 'up';
    if (voteDoc?.value === -1) userVote = 'down';
  }
  return {
    ...post,
    imageUrl: safeImageUrl,
    poll: serializePoll(post.poll, viewerUserId),
    score: post.votes || 0,
    userVote,
    commentCount,
  };
}

exports.createPost = async (req, res) => {
  try {
    const { category, text, tags = [], image, imagePublicId, imageMeta, poll } = req.body;
    const categoryError = validatePostCategory(category);
    if (categoryError) {
      return res.status(400).json({ message: categoryError });
    }
    const textError = validatePostText(text);
    if (textError) {
      return res.status(400).json({ message: textError });
    }
    const tagResult = validateTags(tags);
    if (tagResult.error) {
      return res.status(400).json({ message: tagResult.error });
    }
    const pollResult = validatePoll(poll);
    if (pollResult.error) {
      return res.status(400).json({ message: pollResult.error });
    }

    const user = await User.findById(req.user).select('anonymousName emoji');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { toxicity, moderationFields } = await buildToxicityModeration(text || '');

    const normalizedPoll = pollResult.value
      ? {
          options: pollResult.value.options.map((option) => ({ text: option, votes: 0 })),
          voters: [],
          duration: pollResult.value.duration,
          expiresAt: new Date(Date.now() + getPollDurationMs(pollResult.value.duration)),
        }
      : null;

    const post = await Post.create({
      authorId: req.user,
      anonymousName: user.anonymousName,
      anonymousEmoji: user.emoji,
      category: String(category).trim(),
      text: String(text).trim(),
      tags: tagResult.value,
      image,
      imagePublicId,
      imageMeta,
      ...(normalizedPoll ? { poll: normalizedPoll } : {}),
      ...moderationFields,
    });

    if (moderationFields?.adminReviewStatus === 'pending') {
      await notifyAdmins({
        type: 'admin_toxic_post',
        title: 'Toxic post needs review',
        message: trimMessage(text || 'A post was flagged by safety checks.', 120),
        href: '/admin/flagged',
        metadata: {
          targetType: 'Post',
          targetId: post._id,
          moderationStatus: post.moderationStatus,
        },
      });
    }

    return res.status(201).json({ post: await serializePost(post), toxicity });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.listPosts = async (req, res) => {
  try {
    const { category, exclude, limit } = req.query || {};
    const query = req.userRole === 'admin'
      ? {}
      : {
          $or: [
            { visibility: 'visible' },
            { visibility: { $exists: false } },
            { visibility: null },
          ],
        };

    if (category && String(category).trim() && String(category).trim().toLowerCase() !== 'all') {
      query.category = String(category).trim();
    }

    if (exclude && mongoose.Types.ObjectId.isValid(exclude)) {
      query._id = { $ne: exclude };
    }

    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 0, 0), 100);
    const postsQuery = Post.find(query).sort({ createdAt: -1 });
    if (parsedLimit > 0) {
      postsQuery.limit(parsedLimit);
    }

    const posts = await postsQuery;
    const enrichedPosts = await Promise.all(
      posts.map(p => serializePost(p, req.user).catch(err => {
        console.error("serializePost error:", err);
        return p; // fallback
      }))
    );
    res.json({ posts: enrichedPosts });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getPostById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const isVisibleToUsers = post.visibility === 'visible' || post.visibility === undefined || post.visibility === null;
    const isOwner = req.user && String(post.authorId) === String(req.user);
    if (!isVisibleToUsers && req.userRole !== 'admin' && !isOwner) {
      return res.status(404).json({ message: 'Post not found' });
    }
    return res.json({ post: await serializePost(post, req.user) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updatePost = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (String(post.authorId) !== req.user) {
      return res.status(403).json({ message: 'Not allowed to edit this post' });
    }

    const allowed = ['category', 'text', 'tags', 'image', 'imagePublicId', 'imageMeta'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        post[field] = req.body[field];
      }
    });

    if (req.body.category !== undefined) {
      const categoryError = validatePostCategory(post.category);
      if (categoryError) {
        return res.status(400).json({ message: categoryError });
      }
      post.category = String(post.category).trim();
    }

    if (req.body.text !== undefined) {
      const textError = validatePostText(post.text);
      if (textError) {
        return res.status(400).json({ message: textError });
      }
      post.text = String(post.text).trim();
    }

    if (req.body.tags !== undefined) {
      const tagResult = validateTags(post.tags);
      if (tagResult.error) {
        return res.status(400).json({ message: tagResult.error });
      }
      post.tags = tagResult.value;
    }

    if (req.body.text !== undefined) {
      const { toxicity, moderationFields } = await buildToxicityModeration(post.text || '');
      Object.assign(post, moderationFields);
      await post.save();
      if (moderationFields?.adminReviewStatus === 'pending') {
        await notifyAdmins({
          type: 'admin_toxic_post',
          title: 'Edited post needs review',
          message: trimMessage(post.text || 'A post was flagged by safety checks.', 120),
          href: '/admin/flagged',
          metadata: {
            targetType: 'Post',
            targetId: post._id,
            moderationStatus: post.moderationStatus,
          },
        });
      }
      return res.json({ post: await serializePost(post), toxicity });
    }

    await post.save();
    return res.json({ post: await serializePost(post) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (String(post.authorId) !== req.user && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Not allowed to delete this post' });
    }

    const comments = await Comment.find({ postId: post._id }).select('_id');
    const commentIds = comments.map((comment) => comment._id);

    await Comment.deleteMany({ postId: post._id });
    await PostVote.deleteMany({ postId: post._id });
    if (commentIds.length) {
      await CommentVote.deleteMany({ commentId: { $in: commentIds } });
    }
    await Report.deleteMany({
      $or: [
        { targetId: post._id, targetType: 'Post' },
        ...(commentIds.length ? [{ targetId: { $in: commentIds }, targetType: 'Comment' }] : []),
      ],
    });
    await Post.deleteOne({ _id: post._id });
    return res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.votePost = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const { vote } = req.body;
    if (![1, -1, 0].includes(vote)) {
      return res.status(400).json({ message: 'vote must be 1, -1, or 0' });
    }
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const existingVote = await PostVote.findOne({ postId: post._id, userId: req.user });
    const previousValue = existingVote?.value || 0;
    const nextValue = vote;
    const delta = nextValue - previousValue;

    if (nextValue === 0) {
      if (existingVote) {
        await PostVote.deleteOne({ _id: existingVote._id });
      }
    } else if (existingVote) {
      existingVote.value = nextValue;
      await existingVote.save();
    } else {
      await PostVote.create({ postId: post._id, userId: req.user, value: nextValue });
    }

    if (delta !== 0) {
      post.votes = (post.votes || 0) + delta;
    }

    const totalScore = post.votes || 0;

    const voteModerationFields = buildVoteModerationFields(totalScore, post.moderationStatus);
    if (voteModerationFields) {
      Object.assign(post, voteModerationFields);
      const moderationReasons = Array.isArray(post.moderationReasons) ? post.moderationReasons : [];
      if (!moderationReasons.includes('Automatically hidden because score dropped to -10 or below')) {
        post.moderationReasons = [
          ...moderationReasons,
          'Automatically hidden because score dropped to -10 or below'
        ];
      }
    }
    await post.save();

    return res.json({ post: await serializePost(post, req.user) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.votePoll = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const { optionIndex } = req.body || {};
    if (!Number.isInteger(optionIndex)) {
      return res.status(400).json({ message: 'optionIndex must be an integer' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (!post.poll || !Array.isArray(post.poll.options) || post.poll.options.length < 2) {
      return res.status(400).json({ message: 'This post does not have a poll' });
    }
    if (optionIndex < 0 || optionIndex >= post.poll.options.length) {
      return res.status(400).json({ message: 'Invalid poll option' });
    }
    if (post.poll.expiresAt && new Date(post.poll.expiresAt) <= new Date()) {
      return res.status(400).json({ message: 'This poll has ended' });
    }

    const hasVoted = Array.isArray(post.poll.voters)
      && post.poll.voters.some((entry) => String(entry.userId) === String(req.user));
    if (hasVoted) {
      return res.status(400).json({ message: 'You have already voted in this poll' });
    }

    post.poll.options[optionIndex].votes = Number(post.poll.options[optionIndex].votes || 0) + 1;
    post.poll.voters.push({
      userId: req.user,
      optionIndex,
      votedAt: new Date(),
    });

    await post.save();

    return res.json({
      post: await serializePost(post, req.user),
      poll: serializePoll(post.poll, req.user),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
