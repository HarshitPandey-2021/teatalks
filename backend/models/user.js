const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    campusName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    anonymousName: {
      type: String,
      default: 'Anonymous'
    },
    emoji: {
      type: String,
      default: '😶'
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student'
    },
    banStatus: {
      type: Boolean,
      default: false
    },
    warningCount: {
      type: Number,
      default: 0
    },
    lastWarningAt: {
      type: Date
    },
    banReason: {
      type: String
    },
    bannedAt: {
      type: Date
    },
    bannedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    branch: {
      type: String,
      default: 'CSE',
      trim: true,
      maxlength: 80
    },
    year: {
      type: String,
      default: '1st Year',
      trim: true,
      maxlength: 40
    }
  },
  { timestamps: true}
);

userSchema.index(
  { role: 1 },
  { unique: true, partialFilterExpression: { role: 'admin' } }
);

userSchema.pre('save', async function enforceSingleAdmin() {
  if (this.role !== 'admin') {
    return;
  }

  const existingAdmin = await this.constructor.findOne({
    role: 'admin',
    _id: { $ne: this._id },
  }).select('_id');

  if (existingAdmin) {
    throw new Error('Only one admin account is allowed.');
  }
});

module.exports = mongoose.model('User', userSchema, 'Users');
