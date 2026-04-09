const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

// REGISTER
exports.register = async (req, res) => {
  try {
    const { campusName, email, password } = req.body;

    if (!campusName || !email || !password) {
      return res.status(400).json({
        msg: 'campusName, email, and password are required',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Hash password only
    const hashedPassword = await bcrypt.hash(password, 10);
    const identity = generateIdentity();

    const user = await User.create({
      campusName,
      email,
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
      msg: 'User registered successfully',
      ...buildAuthResponse(user),
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Check if banned
    if (user.banStatus) {
      return res.status(403).json({ msg: 'User is banned' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    res.json(buildAuthResponse(user));

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
