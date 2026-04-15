const Post = require('../models/posts');
const Comment = require('../models/comment');
const User = require('../models/user');
const Vote = require('../models/vote');
const mongoose = require('mongoose');

async function serializePost(postDoc, userId) {
  const post = postDoc.toObject ? postDoc.toObject() : postDoc;
  const commentCount = await Comment.countDocuments({ postId: post._id });

  const safeImageUrl =
    typeof post.image === 'string' && post.image.startsWith('blob:')
      ? null
      : post.image || null;

  // Aggregate score
  const scoreAgg = await Vote.aggregate([
    { $match: { postId: post._id } },
    { $group: { _id: null, total: { $sum: "$value" } } }
  ]);
  const score = scoreAgg[0]?.total || 0;

  // Current user’s vote
  let userVote = 0;
  if (userId) {
    const voteDoc = await Vote.findOne({ postId: post._id, userId });
    userVote = voteDoc ? voteDoc.value : 0;
  }

  return {
    ...post,
    imageUrl: safeImageUrl,
    score,
    commentCount,
    userVote, // 1, -1, or 0
  };
}

exports.createPost = async (req, res) => {
  try {
    const { category, text, tags = [], image, imagePublicId, imageMeta } = req.body;
    if (!category) {
      return res.status(400).json({ message: 'Category is required' });
    }

    const user = await User.findById(req.user).select('anonymousName emoji');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const post = await Post.create({
      authorId: req.user,
      anonymousName: user.anonymousName,
      anonymousEmoji: user.emoji,
      category,
      text,
      tags,
      image,
      imagePublicId,
      imageMeta,
    });

    return res.status(201).json({ post: await serializePost(post) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.listPosts = async (req, res) => {
  try {
    const posts = await Post.find({}).sort({ createdAt: -1 });
    const enrichedPosts = await Promise.all(
      posts.map(p => serializePost(p, req.user).catch(err => {
        console.error("serializePost error:", err);
        return p; // fallback
      }))
    );
    res.json({ posts: enrichedPosts });
  } catch (error) {
    console.error("listPosts error:", error);
    res.status(500).json({ message: error.message });
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

    await Comment.deleteMany({ postId: post._id });
    await Post.deleteOne({ _id: post._id });
    return res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.votePost = async (req, res) => {
  try {
    const { value } = req.body; // 1, -1, or 0 to clear vote
    const userId = req.user;
    const postId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(404).json({ message: 'Post not found' });
    }
    if (![1, -1, 0].includes(value)) {
      return res.status(400).json({ message: 'vote must be 1, -1, or 0' });
    }

    if (value === 0) {
      await Vote.findOneAndDelete({ userId, postId });
    } else {
      await Vote.findOneAndUpdate(
        { userId, postId },
        { value },
        { upsert: true, new: true }
      );
    }

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    return res.json({ post: await serializePost(post, userId) });
  } catch (error) {
    console.error("votePost error:", error);
    return res.status(500).json({ message: error.message });
  }
};

