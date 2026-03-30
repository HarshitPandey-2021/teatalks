const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    rollNumber: {
      type: String,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true
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
      default: '🙂'
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student'
    },
    banStatus: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true}
);

// ✅ THIS IS IMPORTANT
module.exports = mongoose.model('User', userSchema, 'Users');