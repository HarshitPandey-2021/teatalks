const mongoose = require('mongoose');

const adminActionSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    actionType: {
      type: String,
      enum: ['warn_user', 'ban_user', 'unban_user', 'report_update', 'moderate_post', 'moderate_comment'],
      required: true,
    },
    reason: {
      type: String,
      default: '',
    },
    metadata: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AdminAction', adminActionSchema, 'AdminActions');
