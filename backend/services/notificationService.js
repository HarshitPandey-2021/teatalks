const Notification = require('../models/notification');
const User = require('../models/user');
const { sendAdminApprovalAlert } = require('./mailService');

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

function resolveAdminAlertRecipients(admins = []) {
  const overrideEmail = String(process.env.ADMIN_NOTIFICATION_EMAIL || '').trim().toLowerCase();
  if (overrideEmail) {
    return [overrideEmail];
  }

  return admins
    .map((admin) => String(admin.email || '').trim().toLowerCase())
    .filter(Boolean);
}

async function emailAdminsAboutAlert(admins, payload = {}) {
  const recipients = resolveAdminAlertRecipients(admins);
  if (!recipients.length) {
    console.warn('[notificationService] No admin email configured for approval alerts');
    return;
  }

  const uniqueRecipients = [...new Set(recipients)];
  await Promise.all(
    uniqueRecipients.map((toEmail) =>
      sendAdminApprovalAlert({
        toEmail,
        title: payload.title,
        message: payload.message,
        href: payload.href,
        type: payload.type,
        metadata: payload.metadata,
      })
    )
  );
}

async function notifyAdmins(payload = {}) {
  const admins = await User.find({ role: 'admin' }).select('_id email');
  if (!admins.length) return [];

  const notifications = await Promise.all(
    admins.map((admin) =>
      createNotification({
        ...payload,
        recipientId: admin._id,
      })
    )
  );

  emailAdminsAboutAlert(admins, payload).catch((err) => {
    console.warn(`[notificationService] Admin email alert failed: ${err.message}`);
  });

  return notifications;
}

module.exports = {
  createNotification,
  notifyAdmins,
  trimMessage,
};
