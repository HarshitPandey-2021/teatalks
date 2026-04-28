const User = require('../models/user');
const Post = require('../models/posts');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const PasswordResetRequest = require('../models/passwordResetRequest');
const PendingRegistration = require('../models/pendingRegistration');
const { sendPasswordResetOtp, sendRegistrationOtp } = require('../services/mailService');
const Comment = require('../models/comment');
const {
  OTP_LENGTH,
  normalizeEmail,
  validateBranch,
  validateCampusName,
  validatePassword,
  validateYear,
  isValidEmail,
  isValidOtp,
} = require('../utils/validation');

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

async function generateUniqueIdentity() {
  for (let attempt = 0; attempt < 25; attempt += 1) {
    const index = Math.floor(Math.random() * ADJECTIVES.length);
    const baseName = `${ADJECTIVES[index]} ${ANIMALS[index]}`;
    const suffix = attempt === 0 ? '' : ` ${Math.floor(100 + Math.random() * 900)}`;
    const anonymousName = `${baseName}${suffix}`;
    const existingUser = await User.findOne({ anonymousName }).select('_id');
    if (!existingUser) {
      return {
        anonymousName,
        emoji: EMOJIS[index],
      };
    }
  }

  const fallbackIndex = Math.floor(Math.random() * ADJECTIVES.length);
  return {
    anonymousName: `${ADJECTIVES[fallbackIndex]} ${ANIMALS[fallbackIndex]} ${Date.now().toString().slice(-4)}`,
    emoji: EMOJIS[fallbackIndex],
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
      branch: user.branch,
      year: user.year,
      createdAt: user.createdAt,
    },
  };
}

function escapeRegExp(value = '') {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function hashOtp(otp = '') {
  const pepper = process.env.PASSWORD_RESET_PEPPER || process.env.JWT_SECRET;
  return crypto.createHash('sha256').update(`${otp}:${pepper}`).digest('hex');
}

function generateOtp() {
  return `${Math.floor(100000 + Math.random() * 900000)}`;
}

function getGenericForgotPasswordResponse() {
  return { message: 'If an account exists, an OTP has been sent.' };
}

function getGenericRegistrationResponse() {
  return { message: 'If the signup details are valid, an OTP has been sent.' };
}

exports.requestRegistrationOtp = async (req, res) => {
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
    const campusError = validateCampusName(campusName);
    if (campusError) {
      return res.status(400).json({ message: campusError });
    }
    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered. Please log in instead.' });
    }

    const activePending = await PendingRegistration.findOne({
      email: normalizedEmail,
      consumedAt: null,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (activePending && Date.now() - new Date(activePending.createdAt).getTime() < 60 * 1000) {
      return res.status(200).json(getGenericRegistrationResponse());
    }

    await PendingRegistration.updateMany(
      { email: normalizedEmail, consumedAt: null },
      { $set: { consumedAt: new Date() } }
    );

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await PendingRegistration.create({
      campusName: campusName.trim(),
      email: normalizedEmail,
      passwordHash: await bcrypt.hash(password, 10),
      otpHash: hashOtp(otp),
      expiresAt,
      attemptCount: 0,
    });

    await sendRegistrationOtp(normalizedEmail, otp);
    return res.status(200).json(getGenericRegistrationResponse());
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.register = async (req, res) => {
  try {
    const normalizedEmail = normalizeEmail(req.body?.email);
    const otp = `${req.body?.otp || ''}`.trim();
    if (!normalizedEmail || !otp) {
      return res.status(400).json({ message: 'email and otp are required' });
    }
    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    if (!isValidOtp(otp)) {
      return res.status(400).json({ message: `OTP must be exactly ${OTP_LENGTH} digits` });
    }

    const existingUser = await User.findOne({ email: normalizedEmail }).select('_id');
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered. Please log in instead.' });
    }

    const pendingRegistration = await PendingRegistration.findOne({
      email: normalizedEmail,
      consumedAt: null,
    }).sort({ createdAt: -1 });

    if (!pendingRegistration || pendingRegistration.expiresAt <= new Date()) {
      return res.status(400).json({ message: 'OTP is invalid or expired' });
    }
    if (pendingRegistration.attemptCount >= 5) {
      pendingRegistration.consumedAt = new Date();
      await pendingRegistration.save();
      return res.status(429).json({ message: 'Too many attempts. Request a new OTP.' });
    }

    if (hashOtp(otp) !== pendingRegistration.otpHash) {
      pendingRegistration.attemptCount += 1;
      if (pendingRegistration.attemptCount >= 5) {
        pendingRegistration.consumedAt = new Date();
      }
      await pendingRegistration.save();
      return res.status(400).json({ message: 'OTP is invalid or expired' });
    }

    const identity = await generateUniqueIdentity();
    const user = await User.create({
      campusName: pendingRegistration.campusName,
      email: normalizedEmail,
      password: pendingRegistration.passwordHash,
      anonymousName: identity.anonymousName,
      emoji: identity.emoji,
    });

    await PendingRegistration.updateMany(
      { email: normalizedEmail, consumedAt: null },
      { $set: { consumedAt: new Date() } }
    );

    return res.status(201).json({
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
    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Find user by exact email, case-insensitive for older mixed-case records.
    const user = await User.findOne({
      email: { $regex: `^${escapeRegExp(normalizedEmail)}$`, $options: 'i' },
    });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if banned
    if (user.banStatus) {
      return res.status(403).json({ message: 'User is banned' });
    }

    // Compare password
    let isMatch = false;
    const looksHashed = typeof user.password === 'string' && user.password.startsWith('$2');

    if (looksHashed) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      // Backward-compatibility path for legacy plaintext passwords.
      isMatch = password === user.password;
      if (isMatch) {
        user.password = await bcrypt.hash(password, 10);
        await user.save();
      }
    }

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

exports.updateMe = async (req, res) => {
  try {
    const { branch, year } = req.body || {};
    const updates = {};

    if (branch !== undefined) {
      const safeBranch = String(branch).trim();
      const branchError = validateBranch(safeBranch);
      if (branchError) {
        return res.status(400).json({ message: branchError });
      }
      updates.branch = safeBranch;
    }

    if (year !== undefined) {
      const safeYear = String(year).trim();
      const yearError = validateYear(safeYear);
      if (yearError) {
        return res.status(400).json({ message: yearError });
      }
      updates.year = safeYear;
    }

    if (!Object.keys(updates).length) {
      return res.status(400).json({ message: 'No profile fields provided' });
    }

    const user = await User.findByIdAndUpdate(req.user, { $set: updates }, { new: true }).select('-password');
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

exports.getMyActivity = async (req, res) => {
  try {
    const [posts, comments] = await Promise.all([
      Post.find({ authorId: req.user }).sort({ createdAt: -1 }).limit(100),
      Comment.find({ authorId: req.user }).sort({ createdAt: -1 }).limit(100),
    ]);

    const activity = [
      ...posts.map((p) => ({
        id: `post-${p._id}`,
        type: 'post',
        icon: 'edit_square',
        text: `You posted in ${p.category || 'General'}`,
        createdAt: p.createdAt,
        postId: p._id,
      })),
      ...comments.map((c) => ({
        id: `comment-${c._id}`,
        type: 'comment',
        icon: 'chat_bubble',
        text: 'You added a comment',
        createdAt: c.createdAt,
        postId: c.postId,
      })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.json({ activity: activity.slice(0, 50) });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const normalizedEmail = normalizeEmail(req.body?.email);
    if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
      return res.status(200).json(getGenericForgotPasswordResponse());
    }

    const user = await User.findOne({
      email: { $regex: `^${escapeRegExp(normalizedEmail)}$`, $options: 'i' },
    }).select('_id email');
    if (!user) {
      return res.status(200).json(getGenericForgotPasswordResponse());
    }

    const activeReset = await PasswordResetRequest.findOne({
      userId: user._id,
      consumedAt: null,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (activeReset && Date.now() - new Date(activeReset.createdAt).getTime() < 60 * 1000) {
      return res.status(200).json(getGenericForgotPasswordResponse());
    }

    await PasswordResetRequest.updateMany(
      { userId: user._id, consumedAt: null },
      { $set: { consumedAt: new Date() } }
    );

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await PasswordResetRequest.create({
      userId: user._id,
      email: normalizedEmail,
      otpHash: hashOtp(otp),
      expiresAt,
      attemptCount: 0,
    });

    await sendPasswordResetOtp(normalizedEmail, otp);
    return res.status(200).json(getGenericForgotPasswordResponse());
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.verifyForgotPasswordOtp = async (req, res) => {
  try {
    const normalizedEmail = normalizeEmail(req.body?.email);
    const otp = `${req.body?.otp || ''}`.trim();
    if (!normalizedEmail || !otp) {
      return res.status(400).json({ message: 'email and otp are required' });
    }
    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    if (!isValidOtp(otp)) {
      return res.status(400).json({ message: `OTP must be exactly ${OTP_LENGTH} digits` });
    }

    const resetRequest = await PasswordResetRequest.findOne({
      email: normalizedEmail,
      consumedAt: null,
    }).sort({ createdAt: -1 });
    if (!resetRequest || resetRequest.expiresAt <= new Date()) {
      return res.status(400).json({ message: 'OTP is invalid or expired' });
    }
    if (resetRequest.attemptCount >= 5) {
      resetRequest.consumedAt = new Date();
      await resetRequest.save();
      return res.status(429).json({ message: 'Too many attempts. Request a new OTP.' });
    }

    const otpMatches = hashOtp(otp) === resetRequest.otpHash;
    if (!otpMatches) {
      resetRequest.attemptCount += 1;
      if (resetRequest.attemptCount >= 5) {
        resetRequest.consumedAt = new Date();
      }
      await resetRequest.save();
      return res.status(400).json({ message: 'OTP is invalid or expired' });
    }

    const resetToken = jwt.sign(
      {
        sub: String(resetRequest.userId),
        resetRequestId: String(resetRequest._id),
        purpose: 'password_reset',
      },
      process.env.JWT_SECRET,
      { expiresIn: '10m' }
    );

    return res.json({ message: 'OTP verified', resetToken });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.resetPasswordWithOtp = async (req, res) => {
  try {
    const normalizedEmail = normalizeEmail(req.body?.email);
    const { resetToken, newPassword } = req.body || {};
    if (!normalizedEmail || !resetToken || !newPassword) {
      return res.status(400).json({ message: 'email, resetToken, and newPassword are required' });
    }
    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    if (decoded?.purpose !== 'password_reset' || !decoded?.sub || !decoded?.resetRequestId) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const resetRequest = await PasswordResetRequest.findOne({
      _id: decoded.resetRequestId,
      userId: decoded.sub,
      email: normalizedEmail,
      consumedAt: null,
    });
    if (!resetRequest || resetRequest.expiresAt <= new Date()) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const user = await User.findById(decoded.sub);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    await PasswordResetRequest.updateMany(
      { userId: user._id, consumedAt: null },
      { $set: { consumedAt: new Date() } }
    );

    return res.json({ message: 'Password reset successful' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
