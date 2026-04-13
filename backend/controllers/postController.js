const Post = require('../models/posts');
const Comment = require('../models/comment');
const User = require('../models/user');
const mongoose = require('mongoose');

async function serializePost(postDoc) {
  const post = postDoc.toObject ? postDoc.toObject() : postDoc;
  const commentCount = await Comment.countDocuments({ postId: post._id });
  const safeImageUrl =
    typeof post.image === 'string' && post.image.startsWith('blob:')
      ? null
      : post.image || null;
  return {
    ...post,
    imageUrl: safeImageUrl,
    score: post.votes || 0,
    commentCount,
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
    const { category, exclude, limit = 20, page = 1 } = req.query;
    const query = {};
    if (category) query.category = category;
    if (exclude) query._id = { $ne: exclude };

    const safeLimit = Math.min(Number(limit) || 20, 100);
    const safePage = Math.max(Number(page) || 1, 1);
    const skip = (safePage - 1) * safeLimit;

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit);

    const enrichedPosts = await Promise.all(posts.map(serializePost));
    return res.json({ posts: enrichedPosts, page: safePage, limit: safeLimit });
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
    return res.json({ post: await serializePost(post) });
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
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const { vote } = req.body;
    if (![1, -1].includes(vote)) {
      return res.status(400).json({ message: 'vote must be 1 or -1' });
    }

    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { votes: vote } },
      { new: true }
    );
    if (!post) return res.status(404).json({ message: 'Post not found' });
    return res.json({ post: await serializePost(post) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
