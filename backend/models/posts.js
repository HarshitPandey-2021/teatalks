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
    required: true
  },
  text: {
    type: String
  },
  tags: [
    {
      type: String
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
