const Notification = require('../models/notification');
const User = require('../models/user');

function trimMessage(value = '', max = 220) {
  const normalized = String(value || '').replace(/\s+/g, ' ').trim();
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max - 1).trim()}...`;
}

async function createNotification(payload = {}) {
  const { recipientId, title, message, href, type, metadata = {} } = payload;
  if (!recipientId || !title || !message || !href || !type) {
    return null;
  }

  return Notification.create({
    recipientId,
    title: String(title).trim(),
    message: trimMessage(message),
    href: String(href).trim(),
    type: String(type).trim(),
    metadata,
  });
}

async function notifyAdmins(payload = {}) {
  const admins = await User.find({ role: 'admin' }).select('_id');
  if (!admins.length) return [];

  return Promise.all(
    admins.map((admin) =>
      createNotification({
        ...payload,
        recipientId: admin._id,
      })
    )
  );
}

module.exports = {
  createNotification,
  notifyAdmins,
  trimMessage,
};
