const User = require('../models/user');
const Post = require('../models/posts');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const detectToxicity = require('../services/toxicityService').detectToxicity;

const ADJECTIVES = [
  'Silent', 'Curious', 'Shadow', 'Midnight', 'Cool',
  'Lone', 'Blue', 'Brave', 'Wise', 'Swift',
  'Chill', 'Mystic', 'Cosmic', 'Neon', 'Zen',
];
const ANIMALS = [
  'Fox', 'Panda', 'Owl', 'Wolf', 'Cat',
  'Penguin', 'Tiger', 'Eagle', 'Dolphin', 'Koala',
  'Raccoon', 'Falcon', 'Otter', 'Lynx', 'Raven',
];
const EMOJIS = [
  '🦊', '🐼', '🦉', '🐺', '🐱',
  '🐧', '🐯', '🦅', '🐬', '🐨',
  '🦝', '🦅', '🦦', '🐱', '🐦',
];

function generateIdentity() {
  const index = Math.floor(Math.random() * ADJECTIVES.length);
  return {
    anonymousName: `${ADJECTIVES[index]} ${ANIMALS[index]}`,
    emoji: EMOJIS[index],
  };
}

function buildAuthResponse(user) {
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  return {
    token,
    user: {
      _id: user._id,
      email: user.email,
      campusName: user.campusName,
      anonymousName: user.anonymousName,
      anonymousEmoji: user.emoji,
      role: user.role,
    },
  };
}

function normalizeEmail(email = '') {
  return email.trim().toLowerCase();
}

// REGISTER
exports.register = async (req, res) => {
  try {
    const { campusName, email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);
    if (req.body.role && req.body.role !== 'student') {
      return res.status(403).json({ message: 'Role assignment is not allowed in signup' });
    }

    if (!campusName || !normalizedEmail || !password) {
      return res.status(400).json({
        message: 'campusName, email, and password are required',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password only
    const hashedPassword = await bcrypt.hash(password, 10);
    const identity = generateIdentity();

    const user = await User.create({
      campusName,
      email: normalizedEmail,
      password: hashedPassword,
      anonymousName: identity.anonymousName,
      emoji: identity.emoji,
    });

    console.log('Registered user', {
      id: user._id.toString(),
      collection: User.collection?.name,
      db: User.db?.name
    });

    res.status(201).json({
      message: 'User registered successfully',
      ...buildAuthResponse(user),
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    // Find user
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if banned
    if (user.banStatus) {
      return res.status(403).json({ message: 'User is banned' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    res.json(buildAuthResponse(user));

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({
      authorId: req.user,
      $or: [
        { visibility: 'visible' },
        { visibility: { $exists: false } },
        { visibility: null },
      ],
    }).sort({ createdAt: -1 });
    return res.json({
      posts: posts.map((p) => ({
        ...p.toObject(),
        imageUrl: p.image || null,
        score: p.votes || 0,
      })),
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.createPost= async (req, res) => {
   try {
    const { text } = req.body;

    const toxicity = await detectToxicity(text);

    if (toxicity.isToxic) {
      return res.status(400).json({
        message: "Toxic content detected",
        toxicity
      });
    }

    // continue normal logic
    res.json({
      message: "Post created successfully",
      toxicity
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
