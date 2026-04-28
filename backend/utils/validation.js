const mongoose = require('mongoose');

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MESSAGE = 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.';
const OTP_LENGTH = 6;
const POST_MIN_LENGTH = 10;
const POST_MAX_LENGTH = 1000;
const COMMENT_MAX_LENGTH = 1000;
const MAX_TAGS = 5;
const MAX_TAG_LENGTH = 24;
const MAX_REPORT_REASON_LENGTH = 500;
const MAX_SUBJECTS = 12;
const MAX_SUBJECT_LENGTH = 80;
const CAMPUS_NAME_MIN_LENGTH = 2;
const CAMPUS_NAME_MAX_LENGTH = 80;
const PROFESSOR_NAME_MAX_LENGTH = 120;
const DEPARTMENT_MAX_LENGTH = 120;

const BRANCH_OPTIONS = ['CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT', 'AI/ML', 'Data Science', 'Biotech', 'Chemical', 'Aerospace'];
const YEAR_OPTIONS = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'];
const POST_CATEGORIES = ['Academic', 'Hostel', 'Rants', 'General', 'Reviews'];

function normalizeEmail(email = '') {
  return String(email).trim().toLowerCase();
}

function isValidEmail(email = '') {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

function isValidPassword(password = '') {
  const value = String(password);
  return (
    value.length >= PASSWORD_MIN_LENGTH &&
    /[A-Z]/.test(value) &&
    /[a-z]/.test(value) &&
    /\d/.test(value) &&
    /[^A-Za-z0-9]/.test(value)
  );
}

function validatePassword(password = '') {
  return isValidPassword(password) ? null : PASSWORD_MESSAGE;
}

function normalizeOtp(value = '') {
  return String(value).trim();
}

function isValidOtp(value = '') {
  return new RegExp(`^\\d{${OTP_LENGTH}}$`).test(normalizeOtp(value));
}

function validateCampusName(value = '') {
  const normalized = String(value).trim();
  if (!normalized) return 'Campus name is required';
  if (normalized.length < CAMPUS_NAME_MIN_LENGTH || normalized.length > CAMPUS_NAME_MAX_LENGTH) {
    return `Campus name must be between ${CAMPUS_NAME_MIN_LENGTH} and ${CAMPUS_NAME_MAX_LENGTH} characters`;
  }
  return null;
}

function validateBranch(value = '') {
  const normalized = String(value).trim();
  if (!normalized) return 'Branch is required';
  return BRANCH_OPTIONS.includes(normalized) ? null : 'Invalid branch value';
}

function validateYear(value = '') {
  const normalized = String(value).trim();
  if (!normalized) return 'Year is required';
  return YEAR_OPTIONS.includes(normalized) ? null : 'Invalid year value';
}

function normalizeTag(value = '') {
  return String(value).trim().replace(/^#/, '');
}

function validateTags(values = []) {
  if (!Array.isArray(values)) {
    return { error: 'Tags must be an array' };
  }

  if (values.length > MAX_TAGS) {
    return { error: `No more than ${MAX_TAGS} tags are allowed` };
  }

  const normalized = [];
  const seen = new Set();

  for (const value of values) {
    const tag = normalizeTag(value);
    if (!tag) continue;
    if (!/^[A-Za-z0-9_-]+$/.test(tag)) {
      return { error: 'Tags may only contain letters, numbers, underscores, and hyphens' };
    }
    if (tag.length > MAX_TAG_LENGTH) {
      return { error: `Each tag must be at most ${MAX_TAG_LENGTH} characters` };
    }
    const key = tag.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    normalized.push(tag);
  }

  return { value: normalized };
}

function validatePostCategory(value = '') {
  const normalized = String(value).trim();
  if (!normalized) return 'Category is required';
  return POST_CATEGORIES.includes(normalized) ? null : `Category must be one of: ${POST_CATEGORIES.join(', ')}`;
}

function validatePostText(value = '') {
  const normalized = String(value).trim();
  if (!normalized) return 'Post text is required';
  if (normalized.length < POST_MIN_LENGTH) return `Post text must be at least ${POST_MIN_LENGTH} characters`;
  if (normalized.length > POST_MAX_LENGTH) return `Post text must be at most ${POST_MAX_LENGTH} characters`;
  return null;
}

function validateCommentText(value = '', label = 'Comment') {
  const normalized = String(value).trim();
  if (!normalized) return `${label} text is required`;
  if (normalized.length > COMMENT_MAX_LENGTH) return `${label} text must be at most ${COMMENT_MAX_LENGTH} characters`;
  return null;
}

function validateReportReason(value = '') {
  const normalized = String(value).trim();
  if (!normalized) return 'Reason is required';
  if (normalized.length > MAX_REPORT_REASON_LENGTH) {
    return `Reason must be at most ${MAX_REPORT_REASON_LENGTH} characters`;
  }
  return null;
}

function validateProfessorName(value = '') {
  const normalized = String(value).trim();
  if (!normalized) return 'Professor name is required';
  if (normalized.length > PROFESSOR_NAME_MAX_LENGTH) {
    return `Professor name must be at most ${PROFESSOR_NAME_MAX_LENGTH} characters`;
  }
  return null;
}

function validateDepartment(value = '') {
  const normalized = String(value).trim();
  if (!normalized) return 'Department is required';
  if (normalized.length > DEPARTMENT_MAX_LENGTH) {
    return `Department must be at most ${DEPARTMENT_MAX_LENGTH} characters`;
  }
  return null;
}

function validateSubjects(values = []) {
  if (!Array.isArray(values)) {
    return { error: 'Subjects must be an array' };
  }

  if (values.length > MAX_SUBJECTS) {
    return { error: `No more than ${MAX_SUBJECTS} subjects are allowed` };
  }

  const normalized = values
    .map((value) => String(value).trim())
    .filter(Boolean);

  for (const subject of normalized) {
    if (subject.length > MAX_SUBJECT_LENGTH) {
      return { error: `Each subject must be at most ${MAX_SUBJECT_LENGTH} characters` };
    }
  }

  return { value: normalized };
}

function isValidObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value);
}

module.exports = {
  BRANCH_OPTIONS,
  CAMPUS_NAME_MAX_LENGTH,
  CAMPUS_NAME_MIN_LENGTH,
  COMMENT_MAX_LENGTH,
  MAX_REPORT_REASON_LENGTH,
  MAX_TAGS,
  OTP_LENGTH,
  PASSWORD_MESSAGE,
  POST_CATEGORIES,
  POST_MAX_LENGTH,
  POST_MIN_LENGTH,
  YEAR_OPTIONS,
  isValidEmail,
  isValidObjectId,
  isValidOtp,
  normalizeEmail,
  normalizeOtp,
  validateBranch,
  validateCampusName,
  validateCommentText,
  validateDepartment,
  validatePassword,
  validatePostCategory,
  validatePostText,
  validateProfessorName,
  validateReportReason,
  validateSubjects,
  validateTags,
  validateYear,
};
