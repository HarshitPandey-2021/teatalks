const { detectToxicity } = require('./toxicityService');

const TOXIC_THRESHOLD = 0.6;
const AUTO_HIDE_VOTE_THRESHOLD = -10;
const AUTO_HIDE_REPORT_THRESHOLD = 5;

function toUniqueStringArray(values = []) {
  return [...new Set(values.filter((value) => typeof value === 'string' && value.trim()))];
}

async function buildToxicityModeration(text) {
  const content = typeof text === 'string' ? text.trim() : '';
  if (!content) {
    return {
      toxicity: {
        score: 0,
        aiScore: 0,
        localScore: 0,
        isToxic: false,
        reasons: [],
        suggestions: [],
        aiError: null,
      },
      moderationFields: {
        moderationScore: 0,
        moderationStatus: 'normal',
        visibility: 'visible',
        adminReviewStatus: 'none',
        moderationReasons: [],
        moderationSuggestions: [],
        hiddenReason: '',
        hiddenAt: null,
        moderatedAt: new Date(),
      },
    };
  }

  const toxicity = await detectToxicity(content);
  const score = Number(toxicity?.score || 0);
  const isToxic = score >= TOXIC_THRESHOLD;

  return {
    toxicity,
    moderationFields: {
      moderationScore: score,
      moderationStatus: isToxic ? 'toxic' : 'normal',
      visibility: isToxic ? 'hidden' : 'visible',
      adminReviewStatus: isToxic ? 'pending' : 'none',
      moderationReasons: toUniqueStringArray(toxicity?.reasons),
      moderationSuggestions: toUniqueStringArray(toxicity?.suggestions),
      hiddenReason: isToxic ? 'toxicity' : '',
      hiddenAt: isToxic ? new Date() : null,
      moderatedAt: new Date(),
    },
  };
}

function buildReportModerationFields(reports, currentStatus = 'normal') {
  if (reports < AUTO_HIDE_REPORT_THRESHOLD) {
    return null;
  }

  return {
    moderationStatus: currentStatus === 'toxic' ? 'toxic' : 'reported',
    visibility: 'hidden',
    adminReviewStatus: 'pending',
    hiddenReason: 'report_threshold',
    hiddenAt: new Date(),
    moderatedAt: new Date(),
  };
}

function buildVoteModerationFields(score, currentStatus = 'normal') {
  if (score > AUTO_HIDE_VOTE_THRESHOLD) {
    return null;
  }

  return {
    moderationStatus: currentStatus === 'toxic' ? 'toxic' : 'reported',
    visibility: 'hidden',
    adminReviewStatus: 'pending',
    hiddenReason: 'vote_threshold',
    hiddenAt: new Date(),
    moderatedAt: new Date(),
  };
}

function buildAdminModerationFields(status, reason, adminId) {
  const isNormal = status === 'normal';

  return {
    moderationStatus: isNormal ? 'normal' : 'toxic',
    visibility: isNormal ? 'visible' : 'hidden',
    adminReviewStatus: 'reviewed',
    hiddenReason: isNormal ? '' : (reason || 'admin_action'),
    hiddenAt: isNormal ? null : new Date(),
    moderatedAt: new Date(),
    moderatedBy: adminId || null,
  };
}

module.exports = {
  TOXIC_THRESHOLD,
  AUTO_HIDE_VOTE_THRESHOLD,
  AUTO_HIDE_REPORT_THRESHOLD,
  buildToxicityModeration,
  buildReportModerationFields,
  buildVoteModerationFields,
  buildAdminModerationFields,
};
