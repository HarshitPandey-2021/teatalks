const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  value: { type: Number, enum: [1, -1], required: true }, // 1 = upvote, -1 = downvote
}, { timestamps: true });

voteSchema.index({ userId: 1, postId: 1 }, { unique: true }); // prevent duplicates

module.exports = mongoose.model('Vote', voteSchema , 'votes');
