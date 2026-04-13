const User = require('../models/user');
const AdminAction = require('../models/adminAction');
const Report = require('../models/reports');

exports.listUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 });
    return res.json({ users });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.warnUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = '' } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.warningCount += 1;
    user.lastWarningAt = new Date();
    await user.save();

    await AdminAction.create({
      adminId: req.user,
      targetUserId: user._id,
      actionType: 'warn_user',
      reason,
      metadata: { warningCount: user.warningCount },
    });

    return res.json({ message: 'User warned successfully', user });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.setBanStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { banned, reason = '' } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.banStatus = !!banned;
    user.banReason = banned ? reason : '';
    user.bannedAt = banned ? new Date() : null;
    user.bannedBy = banned ? req.user : null;
    await user.save();

    await AdminAction.create({
      adminId: req.user,
      targetUserId: user._id,
      actionType: banned ? 'ban_user' : 'unban_user',
      reason,
    });

    return res.json({
      message: banned ? 'User banned successfully' : 'User unbanned successfully',
      user,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.listActions = async (req, res) => {
  try {
    const actions = await AdminAction.find({})
      .sort({ createdAt: -1 })
      .limit(200)
      .populate('adminId', 'email campusName role')
      .populate('targetUserId', 'email campusName role banStatus warningCount');
    return res.json({ actions });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.listReports = async (req, res) => {
  try {
    const { status = 'pending', type } = req.query;
    const query = {};
    if (status !== 'all') query.status = status;
    if (type) query.targetType = type;

    const reports = await Report.find(query)
      .sort({ createdAt: -1 })
      .limit(300)
      .populate('reporterId', 'email anonymousName emoji role');

    return res.json({ reports });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'reviewed', 'resolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    report.status = status;
    await report.save();

    await AdminAction.create({
      adminId: req.user,
      actionType: 'report_update',
      reason: `Updated report ${report._id} to ${status}`,
      metadata: { reportId: report._id, status },
    });

    return res.json({ message: 'Report status updated', report });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
