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
  }
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema, 'Comments');