const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  anonymousName: {
    type: String,
    default: 'Anonymous'
  },
  text: {
    type: String,
    required: true
  },
  parentCommentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
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

module.exports = mongoose.model('Comment', commentSchema, 'Comments');
