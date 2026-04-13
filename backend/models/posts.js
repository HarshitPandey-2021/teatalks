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
  }
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema, 'Posts');