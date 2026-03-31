const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const detectToxicity = require('../services/toxicityService').detectToxicity;

// REGISTER
exports.register = async (req, res) => {
  try {
    const { rollNumber, name, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ rollNumber });
    if (existingUser) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Hash password only
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      rollNumber,
      name,
      password: hashedPassword
    });

    console.log('Registered user', {
      id: user._id.toString(),
      collection: User.collection?.name,
      db: User.db?.name
    });

    res.json({ msg: 'User registered successfully', id: user._id });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { rollNumber, password } = req.body;

    // Find user
    const user = await User.findOne({ rollNumber });
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

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      anonymousName: user.anonymousName,
      emoji: user.emoji
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
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