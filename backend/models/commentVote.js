const mongoose = require('mongoose');

const commentVoteSchema = new mongoose.Schema(
  {
    commentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    value: {
      type: Number,
      enum: [-1, 1],
      required: true,
    },
  },
  { timestamps: true }
);

commentVoteSchema.index({ commentId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('CommentVote', commentVoteSchema, 'CommentVotes');
