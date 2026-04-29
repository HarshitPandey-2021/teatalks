const { POST_CATEGORIES } = require('../utils/validation');

const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  anonymousName: {
    type: String,
    default: 'Anonymous'
  },
  anonymousEmoji: {
    type: String,
    default: '😶'
  },
  category: {
    type: String,
    required: true,
    trim: true,
    enum: POST_CATEGORIES
  },
  text: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  tags: [
    {
      type: String,
      trim: true,
      maxlength: 24
    }
  ],
  image: {
    type: String
  },
  imagePublicId: {
    type: String
  },
  imageMeta: {
    width: Number,
    height: Number,
    format: String,
    bytes: Number
  },
  poll: {
    options: [
      {
        text: {
          type: String,
          trim: true,
          maxlength: 120,
        },
        votes: {
          type: Number,
          default: 0,
          min: 0,
        },
      }
    ],
    voters: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        optionIndex: {
          type: Number,
          required: true,
          min: 0,
        },
        votedAt: {
          type: Date,
          default: Date.now,
        },
      }
    ],
    duration: {
      type: String,
      enum: ['6h', '12h', '24h', '48h'],
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  votes: {
    type: Number,
    default: 0
  },
  reports: {
    type: Number,
    default: 0
  },
  moderationScore: {
    type: Number,
    default: 0
  },
  moderationStatus: {
    type: String,
    enum: ['normal', 'toxic', 'reported'],
    default: 'normal'
  },
  visibility: {
    type: String,
    enum: ['visible', 'hidden'],
    default: 'visible'
  },
  adminReviewStatus: {
    type: String,
    enum: ['none', 'pending', 'reviewed'],
    default: 'none'
  },
  moderationReasons: {
    type: [String],
    default: []
  },
  moderationSuggestions: {
    type: [String],
    default: []
  },
  hiddenReason: {
    type: String,
    default: ''
  },
  hiddenAt: {
    type: Date,
    default: null
  },
  moderatedAt: {
    type: Date,
    default: null
  },
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema, 'Posts');
