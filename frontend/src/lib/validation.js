export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MESSAGE = 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.'
export const OTP_LENGTH = 6
export const POST_MIN_LENGTH = 10
export const POST_MAX_LENGTH = 1000
export const COMMENT_MAX_LENGTH = 1000
export const MAX_TAGS = 5
export const MAX_TAG_LENGTH = 24
export const MAX_REPORT_REASON_LENGTH = 500

export const BRANCH_OPTIONS = ['CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT', 'AI/ML', 'Data Science', 'Biotech', 'Chemical', 'Aerospace']
export const YEAR_OPTIONS = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year']
export const POST_CATEGORIES = [
  'Academic',
  'Hostel',
  'Rants',
  'General',
  'Reviews',
  'Polls',
  'Prof Review',
  'Hostel Life',
  'Questions',
  'Lost & Found',
  'Memes & Fun',
  'Campus News',
]

export function normalizeEmail(email = '') {
  return String(email).trim().toLowerCase()
}

export function isValidEmail(email = '') {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())
}

export function isValidPassword(password = '') {
  const value = String(password)
  return (
    value.length >= PASSWORD_MIN_LENGTH &&
    /[A-Z]/.test(value) &&
    /[a-z]/.test(value) &&
    /\d/.test(value) &&
    /[^A-Za-z0-9]/.test(value)
  )
}

export function normalizeOtp(value = '') {
  return String(value).trim()
}

export function isValidOtp(value = '') {
  return new RegExp(`^\\d{${OTP_LENGTH}}$`).test(normalizeOtp(value))
}

export function normalizeTag(value = '') {
  return String(value).trim().replace(/^#/, '')
}

export function validatePostText(value = '') {
  const text = String(value).trim()
  if (!text) return 'Post text is required'
  if (text.length < POST_MIN_LENGTH) return `Post text must be at least ${POST_MIN_LENGTH} characters`
  if (text.length > POST_MAX_LENGTH) return `Post text must be at most ${POST_MAX_LENGTH} characters`
  return null
}

export function validateTags(values = []) {
  if (!Array.isArray(values)) {
    return { error: 'Tags must be an array' }
  }

  if (values.length > MAX_TAGS) {
    return { error: `No more than ${MAX_TAGS} tags are allowed` }
  }

  const seen = new Set()
  const normalized = []

  for (const value of values) {
    const tag = normalizeTag(value)
    if (!tag) continue
    if (!/^[A-Za-z0-9_-]+$/.test(tag)) {
      return { error: 'Tags may only contain letters, numbers, underscores, and hyphens' }
    }
    if (tag.length > MAX_TAG_LENGTH) {
      return { error: `Each tag must be at most ${MAX_TAG_LENGTH} characters` }
    }
    const key = tag.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    normalized.push(tag)
  }

  return { value: normalized }
}
