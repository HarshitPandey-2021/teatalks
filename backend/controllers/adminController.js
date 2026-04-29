const User = require('../models/user');
const AdminAction = require('../models/adminAction');
const Report = require('../models/reports');
const Post = require('../models/posts');
const Comment = require('../models/comment');
const mongoose = require('mongoose');
const { buildAdminModerationFields } = require('../services/contentModerationService');
const { createNotification, trimMessage } = require('../services/notificationService');

function getSinceDate(days = 1) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function toPercent(value, total) {
  if (!total) return 0;
  return Math.round((value / total) * 1000) / 10;
}

function getSeverity(score = 0, reports = 0, status = 'pending') {
  if (status === 'pending' && (score >= 0.9 || reports >= 10)) return 'critical';
  if (score >= 0.6 || reports >= 5) return 'medium';
  return 'low';
}

function getMainReason(item) {
  if (Array.isArray(item?.moderationReasons) && item.moderationReasons.length > 0) {
    return item.moderationReasons[0];
  }
  if (item?.hiddenReason) {
    return item.hiddenReason.replace(/_/g, ' ');
  }
  return 'Needs review';
}

function buildFlaggedItem(item, type, reportMeta = {}) {
  const moderationScore = Number(item?.moderationScore || 0);
  const reportCount = Number(reportMeta?.reportCount || 0);
  const activityAt =
    reportMeta?.latestReportAt ||
    item?.moderatedAt ||
    item?.hiddenAt ||
    item?.createdAt;
  return {
    id: String(item._id),
    type: type.toLowerCase(),
    targetType: type,
    targetId: String(item._id),
    status: item.adminReviewStatus === 'reviewed' ? 'reviewed' : 'pending',
    severity: getSeverity(moderationScore, reportCount, item.adminReviewStatus),
    anonymousEmoji: item.anonymousEmoji || '🙂',
    anonymousName: item.anonymousName || 'Anonymous',
    authorId: item.authorId ? String(item.authorId) : null,
    text: item.text || '',
    reasons: Array.isArray(item.moderationReasons) && item.moderationReasons.length > 0
      ? item.moderationReasons
      : [getMainReason(item)],
    reportCount,
    moderationScore: Math.round(moderationScore * 100),
    mainReason: getMainReason(item),
    createdAt: activityAt,
    activityAt,
    visibility: item.visibility || 'visible',
    moderationStatus: item.moderationStatus || 'normal',
    hiddenReason: item.hiddenReason || '',
    reason: reportMeta?.latestReason || getMainReason(item),
    reporterId: reportMeta?.latestReporter || {
      anonymousName: 'Auto moderation',
      emoji: '🤖',
      email: 'Safety system',
    },
  };
}

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function parseBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return null;
}

function parsePagination(query) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 50, 1), 200);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

async function getActionablePendingReports() {
  const pendingReports = await Report.find({ status: 'pending' })
    .sort({ createdAt: -1 })
    .populate('reporterId', 'anonymousName emoji email');

  if (pendingReports.length === 0) {
    return [];
  }

  const postIds = pendingReports
    .filter((report) => report.targetType === 'Post')
    .map((report) => report.targetId);
  const commentIds = pendingReports
    .filter((report) => report.targetType === 'Comment')
    .map((report) => report.targetId);

  const [posts, comments] = await Promise.all([
    postIds.length
      ? Post.find({ _id: { $in: postIds } }).select('_id text category anonymousName anonymousEmoji authorId moderationScore moderationStatus adminReviewStatus moderationReasons hiddenReason visibility hiddenAt moderatedAt createdAt')
      : Promise.resolve([]),
    commentIds.length
      ? Comment.find({ _id: { $in: commentIds } }).select('_id text postId category anonymousName anonymousEmoji authorId moderationScore moderationStatus adminReviewStatus moderationReasons hiddenReason visibility hiddenAt moderatedAt createdAt')
      : Promise.resolve([]),
  ]);

  const postMap = new Map(posts.map((item) => [String(item._id), item]));
  const commentMap = new Map(comments.map((item) => [String(item._id), item]));
  const actionableReports = [];
  const orphanedReportIds = [];

  pendingReports.forEach((report) => {
    const targetId = String(report.targetId);
    const target = report.targetType === 'Post' ? postMap.get(targetId) : commentMap.get(targetId);

    if (!target) {
      orphanedReportIds.push(report._id);
      return;
    }

    actionableReports.push({ report, target });
  });

  if (orphanedReportIds.length > 0) {
    await Report.updateMany(
      { _id: { $in: orphanedReportIds }, status: 'pending' },
      { $set: { status: 'resolved' } }
    );
  }

  return actionableReports;
}

async function loadFlaggedContentItems({ status = 'pending', type = 'all', limit = 200 } = {}) {
  const actionablePendingReports = await getActionablePendingReports();
  const groupedReportMap = new Map();

  actionablePendingReports.forEach(({ report }) => {
    const key = `${report.targetType}:${String(report.targetId)}`;
    const current = groupedReportMap.get(key) || { reportCount: 0, latestReportAt: null, latestReason: '', latestReporter: null };
    groupedReportMap.set(key, {
      reportCount: current.reportCount + 1,
      latestReportAt:
        !current.latestReportAt || new Date(report.createdAt) > new Date(current.latestReportAt)
          ? report.createdAt
          : current.latestReportAt,
      latestReason:
        !current.latestReportAt || new Date(report.createdAt) >= new Date(current.latestReportAt)
          ? report.reason
          : current.latestReason,
      latestReporter:
        !current.latestReportAt || new Date(report.createdAt) >= new Date(current.latestReportAt)
          ? report.reporterId
          : current.latestReporter,
    });
  });

  const pendingModerationQuery = {
    adminReviewStatus: 'pending',
    moderationStatus: { $in: ['toxic', 'reported'] },
  };

  const [posts, comments] = await Promise.all([
    type === 'Comment'
      ? Promise.resolve([])
      : Post.find(pendingModerationQuery).sort({ createdAt: -1 }).limit(200),
    type === 'Post'
      ? Promise.resolve([])
      : Comment.find(pendingModerationQuery).sort({ createdAt: -1 }).limit(200),
  ]);

  const itemMap = new Map();
  const pushItem = (doc, docType) => {
    const key = `${docType}:${String(doc._id)}`;
    itemMap.set(key, buildFlaggedItem(doc, docType, groupedReportMap.get(key) || {}));
  };

  posts.forEach((item) => pushItem(item, 'Post'));
  comments.forEach((item) => pushItem(item, 'Comment'));

  actionablePendingReports.forEach(({ report, target }) => {
    if (type !== 'all' && report.targetType !== type) return;
    const key = `${report.targetType}:${String(report.targetId)}`;
    if (!itemMap.has(key)) {
      itemMap.set(key, buildFlaggedItem(target, report.targetType, groupedReportMap.get(key) || {}));
    }
  });

  const items = Array.from(itemMap.values())
    .filter((item) => {
      if (status === 'all') return true;
      if (status === 'reviewed') return item.status === 'reviewed';
      return item.status === 'pending';
    })
    .sort((a, b) => new Date(b.activityAt || b.createdAt) - new Date(a.activityAt || a.createdAt));

  return items.slice(0, limit);
}

exports.listUsers = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const [postCounts, allPosts, allComments, allReports] = await Promise.all([
      Post.aggregate([
        { $group: { _id: '$authorId', postCount: { $sum: 1 } } }
      ]),
      Post.find({}).select('_id authorId'),
      Comment.find({}).select('_id authorId'),
      Report.find({}).select('targetId targetType'),
    ]);

    const postCountMap = new Map(postCounts.map((item) => [String(item._id), item.postCount]));
    const authorByTarget = new Map();
    allPosts.forEach((post) => authorByTarget.set(`Post:${String(post._id)}`, String(post.authorId)));
    allComments.forEach((comment) => authorByTarget.set(`Comment:${String(comment._id)}`, String(comment.authorId)));

    const reportCountMap = new Map();
    allReports.forEach((report) => {
      const authorId = authorByTarget.get(`${report.targetType}:${String(report.targetId)}`);
      if (!authorId) return;
      reportCountMap.set(authorId, (reportCountMap.get(authorId) || 0) + 1);
    });

    const duplicateCounter = new Map();
    const enrichedUsers = [];

    for (const user of users) {
      const baseName = user.anonymousName || 'Anonymous';
      const seenCount = duplicateCounter.get(baseName) || 0;
      duplicateCounter.set(baseName, seenCount + 1);

      const uniqueName = seenCount === 0
        ? baseName
        : `${baseName} ${String(user._id).slice(-4)}`;

      if (uniqueName !== user.anonymousName) {
        user.anonymousName = uniqueName;
        await user.save();
      }

      enrichedUsers.push({
        _id: user._id,
        anonymousName: uniqueName,
        emoji: user.emoji,
        role: user.role,
        branch: user.branch,
        year: user.year,
        banStatus: user.banStatus,
        warningCount: user.warningCount,
        createdAt: user.createdAt,
        postCount: postCountMap.get(String(user._id)) || 0,
        reportCount: reportCountMap.get(String(user._id)) || 0,
      });
    }

    return res.json({ users: enrichedUsers, page, limit });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.warnUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = '' } = req.body;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    const user = await User.findById(id).select('-password');
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
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }
    const parsedBanned = parseBoolean(banned);
    if (parsedBanned === null) {
      return res.status(400).json({ message: 'banned must be a boolean' });
    }

    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.banStatus = parsedBanned;
    user.banReason = parsedBanned ? reason : '';
    user.bannedAt = parsedBanned ? new Date() : null;
    user.bannedBy = parsedBanned ? req.user : null;
    await user.save();

    await AdminAction.create({
      adminId: req.user,
      targetUserId: user._id,
      actionType: parsedBanned ? 'ban_user' : 'unban_user',
      reason,
    });

    return res.json({
      message: parsedBanned ? 'User banned successfully' : 'User unbanned successfully',
      user,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.listActions = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const actions = await AdminAction.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('adminId', 'email campusName role')
      .populate('targetUserId', 'email campusName role banStatus warningCount');
    return res.json({ actions, page, limit });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.listReports = async (req, res) => {
  try {
    const { status = 'pending', type } = req.query;
    const { page, limit, skip } = parsePagination(req.query);
    const query = {};
    if (status !== 'all') query.status = status;
    if (type) query.targetType = type;

    const reports = await Report.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('reporterId', 'email anonymousName emoji role');

    return res.json({ reports, page, limit });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid report id' });
    }
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

exports.getOverview = async (req, res) => {
  try {
    const since = getSinceDate(1);
    const pendingFlaggedItems = await loadFlaggedContentItems({ status: 'pending', type: 'all', limit: 200 });
    const pendingReports = pendingFlaggedItems.length;
    const recentReports = pendingFlaggedItems.slice(0, 5);

    const [
      totalPosts,
      totalComments,
      totalUsers,
      hiddenPosts,
      hiddenComments,
      recentActions,
      postsToday,
      commentsToday,
      totalReports,
      toxicPosts,
      toxicComments,
    ] = await Promise.all([
      Post.countDocuments({}),
      Comment.countDocuments({}),
      User.countDocuments({}),
      Post.countDocuments({ visibility: 'hidden' }),
      Comment.countDocuments({ visibility: 'hidden' }),
      AdminAction.find({})
        .sort({ createdAt: -1 })
        .limit(20),
      Post.countDocuments({ createdAt: { $gte: since } }),
      Comment.countDocuments({ createdAt: { $gte: since } }),
      Report.countDocuments({}),
      Post.countDocuments({ moderationStatus: 'toxic' }),
      Comment.countDocuments({ moderationStatus: 'toxic' }),
    ]);

    const reportsWithTargets = await Promise.all(
      recentReports.map(async (report) => {
        const Model = report.targetType === 'Post' ? Post : Comment;
        const target = await Model.findById(report.targetId).select('text category anonymousName anonymousEmoji');
        return {
          id: report.id || `${report.targetType || report.type || 'item'}-${report.targetId || report._id || report.createdAt}`,
          title: target?.category
            ? `${report.targetType} in ${target.category}`
            : `${report.targetType} Report`,
          reporter: report.reporterId?.anonymousName
            ? `${report.reporterId.emoji || '🙂'} ${report.reporterId.anonymousName}`
            : report.reporterId?.email || 'Unknown reporter',
          reason: report.reason,
          time: report.createdAt,
          severity: report.targetType === 'Post' ? 'medium' : 'low',
          icon: report.targetType === 'Post' ? 'forum' : 'chat',
        };
      })
    );

    const actionsToday = recentActions.filter((action) => action.createdAt >= since).length;
    const avgQueueMinutes = pendingReports > 0 && recentReports.length > 0
      ? Math.round(
          recentReports.reduce((sum, report) => sum + ((Date.now() - new Date(report.activityAt || report.createdAt).getTime()) / 60000), 0) /
          recentReports.length
        )
      : 0;

    return res.json({
      stats: {
        totalPosts,
        totalUsers,
        pendingReports,
        hiddenContent: hiddenPosts + hiddenComments,
        activeToday: postsToday + commentsToday,
      },
      recentReports: reportsWithTargets,
      health: {
        reportBacklogPercent: toPercent(pendingReports, Math.max(totalReports, 1)),
        contentSafetyPercent: 100 - toPercent(toxicPosts + toxicComments, Math.max(totalPosts + totalComments, 1)),
        serverLoadPercent: Math.min(100, Math.max(10, Math.round(((postsToday + commentsToday) / 50) * 100))),
        actionsToday,
        avgQueueMinutes,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.listFlaggedContent = async (req, res) => {
  try {
    const { status = 'pending', type = 'all' } = req.query;
    const { page, limit } = parsePagination(req.query);
    const items = await loadFlaggedContentItems({ status, type, limit: 400 });

    const start = (page - 1) * limit;
    return res.json({ items: items.slice(start, start + limit), page, limit, total: items.length });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateContentModeration = async (req, res) => {
  try {
    const { targetType, status, reason = '' } = req.body;
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid content id' });
    }

    if (!['Post', 'Comment'].includes(targetType)) {
      return res.status(400).json({ message: 'targetType must be Post or Comment' });
    }
    if (!['normal', 'toxic'].includes(status)) {
      return res.status(400).json({ message: 'status must be normal or toxic' });
    }

    const Model = targetType === 'Post' ? Post : Comment;
    const content = await Model.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ message: `${targetType} not found` });
    }

    Object.assign(content, buildAdminModerationFields(status, reason, req.user));
    await content.save();

    await Report.updateMany(
      {
        targetId: content._id,
        targetType,
        status: 'pending',
      },
      {
        $set: { status: 'resolved' },
      }
    );

    await AdminAction.create({
      adminId: req.user,
      actionType: targetType === 'Post' ? 'moderate_post' : 'moderate_comment',
      reason,
      metadata: {
        targetType,
        targetId: content._id,
        status,
      },
    });

    if (content.authorId) {
      const contentHref =
        targetType === 'Post'
          ? `/posts/${content._id}`
          : `/posts/${content.postId}`;

      await createNotification({
        recipientId: content.authorId,
        type: status === 'normal' ? 'content_restored' : 'content_removed',
        title: status === 'normal' ? 'Your content was restored' : 'Your content was removed',
        message:
          status === 'normal'
            ? `${targetType} review is complete. Your content is visible again.`
            : `${targetType} review is complete. ${trimMessage(reason || 'The content violated moderation guidelines.', 150)}`,
        href: contentHref,
        metadata: {
          targetType,
          targetId: content._id,
          postId: content.postId || content._id,
          status,
        },
      });
    }

    return res.json({
      message: `${targetType} moderation updated`,
      content,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
