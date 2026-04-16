const Report = require('../models/reports');
const Post = require('../models/posts');
const Comment = require('../models/comment');
const { buildReportModerationFields, AUTO_HIDE_REPORT_THRESHOLD } = require('../services/contentModerationService');

exports.createReport = async (req, res) => {
  try {
    const { targetId, targetType, reason } = req.body;
    if (!targetId || !targetType || !reason) {
      return res.status(400).json({ message: 'targetId, targetType and reason are required' });
    }
    if (!['Post', 'Comment'].includes(targetType)) {
      return res.status(400).json({ message: 'targetType must be Post or Comment' });
    }

    const target =
      targetType === 'Post' ? await Post.findById(targetId) : await Comment.findById(targetId);
    if (!target) return res.status(404).json({ message: `${targetType} not found` });

    const existing = await Report.findOne({
      reporterId: req.user,
      targetId,
      targetType,
      status: 'pending',
    });
    if (existing) {
      return res.status(400).json({ message: 'You already reported this item' });
    }

    const report = await Report.create({
      reporterId: req.user,
      targetId,
      targetType,
      reason,
    });

    const Model = targetType === 'Post' ? Post : Comment;
    const updatedTarget = await Model.findByIdAndUpdate(
      targetId,
      { $inc: { reports: 1 } },
      { new: true }
    );

    let autoHidden = false;
    if (updatedTarget) {
      const moderationFields = buildReportModerationFields(updatedTarget.reports, updatedTarget.moderationStatus);
      if (moderationFields) {
        Object.assign(updatedTarget, moderationFields);
        if (!updatedTarget.moderationReasons.includes(`Automatically hidden after ${AUTO_HIDE_REPORT_THRESHOLD} reports`)) {
          updatedTarget.moderationReasons = [
            ...updatedTarget.moderationReasons,
            `Automatically hidden after ${AUTO_HIDE_REPORT_THRESHOLD} reports`
          ];
        }
        await updatedTarget.save();
        autoHidden = true;
      }
    }

    return res.status(201).json({ report, autoHidden });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getMyReports = async (req, res) => {
  try {
    const reports = await Report.find({ reporterId: req.user }).sort({ createdAt: -1 });
    return res.json({ reports });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
