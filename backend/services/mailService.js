const nodemailer = require('nodemailer');

let transporter;

function getTransporter() {
  if (transporter) {
    return transporter;
  }

  if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT_MS || 20000),
    greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT_MS || 20000),
    socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT_MS || 30000),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
}

function handleMissingSmtpConfig(contextLabel, toEmail, otp) {
  const message = 'Email delivery is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM.';
  const allowConsoleFallback = String(process.env.MAIL_ALLOW_CONSOLE_OTP || '').toLowerCase() === 'true';
  if (!allowConsoleFallback) {
    const err = new Error(message);
    err.code = 'SMTP_NOT_CONFIGURED';
    throw err;
  }

  console.warn(`[mailService] ${message}`);
  console.warn('[mailService] Falling back to console OTP because MAIL_ALLOW_CONSOLE_OTP=true');
  console.log(`${contextLabel} for ${toEmail}: ${otp}`);
}

async function sendViaBrevoApi({ toEmail, subject, text, html }) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return false;

  const fromEmail = process.env.SMTP_FROM || process.env.BREVO_SENDER_EMAIL || process.env.SMTP_USER;
  if (!fromEmail) {
    const err = new Error('BREVO_API_KEY is set but sender email is missing. Set SMTP_FROM or BREVO_SENDER_EMAIL.');
    err.code = 'BREVO_SENDER_MISSING';
    throw err;
  }

  const fromName = process.env.BREVO_SENDER_NAME || 'TeaTalks';
  const controller = new AbortController();
  const apiTimeoutMs = Number(process.env.BREVO_API_TIMEOUT_MS || 30000);
  const timeoutHandle = setTimeout(() => controller.abort(), apiTimeoutMs);
  let response;
  try {
    response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        sender: { email: fromEmail, name: fromName },
        to: [{ email: toEmail }],
        subject,
        htmlContent: html,
        textContent: text,
      }),
      signal: controller.signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      const timeoutError = new Error(`Brevo API request timed out after ${apiTimeoutMs}ms`);
      timeoutError.code = 'BREVO_API_TIMEOUT';
      throw timeoutError;
    }
    throw err;
  } finally {
    clearTimeout(timeoutHandle);
  }

  if (!response.ok) {
    const payload = await response.text();
    const err = new Error(`Brevo API send failed (${response.status}): ${payload}`);
    err.code = 'BREVO_API_SEND_FAILED';
    throw err;
  }

  return true;
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const DEFAULT_PRODUCTION_FRONTEND_URL = 'https://teatalks-six.vercel.app';
const DEFAULT_LOCAL_FRONTEND_URL = 'http://localhost:3000';

function parseAllowedFrontendOrigins() {
  const raw = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  return raw.length ? raw : [DEFAULT_PRODUCTION_FRONTEND_URL, DEFAULT_LOCAL_FRONTEND_URL];
}

function getFrontendBaseUrl() {
  const explicit = (process.env.FRONTEND_URL || process.env.APP_URL || '').trim();
  if (explicit) {
    const url = explicit.replace(/\/$/, '');
    if (process.env.NODE_ENV === 'production' && /localhost|127\.0\.0\.1/i.test(url)) {
      console.warn(
        `[mailService] FRONTEND_URL is "${url}" in production. Admin email links will be wrong. Set FRONTEND_URL=${DEFAULT_PRODUCTION_FRONTEND_URL}`
      );
    }
    return url;
  }

  const productionOrigin = parseAllowedFrontendOrigins().find(
    (origin) => origin.startsWith('https://') && !/localhost|127\.0\.0\.1/i.test(origin)
  );
  if (productionOrigin) {
    return productionOrigin.replace(/\/$/, '');
  }

  if (process.env.NODE_ENV === 'production') {
    return DEFAULT_PRODUCTION_FRONTEND_URL;
  }

  return DEFAULT_LOCAL_FRONTEND_URL;
}

function buildAdminLoginUrl(href = '/admin/flagged') {
  const safeHref = String(href || '/admin/flagged').startsWith('/admin') ? href : '/admin/flagged';
  const redirect = encodeURIComponent(safeHref);
  return `${getFrontendBaseUrl()}/login?redirect=${redirect}`;
}

function getAlertTypeLabel(type = '') {
  const labels = {
    admin_report_created: 'User Report',
    admin_toxic_post: 'Toxic Post',
    admin_toxic_comment: 'Toxic Comment',
  };
  return labels[type] || 'Moderation Alert';
}

function buildAdminApprovalEmailHtml({ title, message, type, metadata = {}, actionUrl }) {
  const alertLabel = getAlertTypeLabel(type);
  const targetType = metadata.targetType ? escapeHtml(metadata.targetType) : '—';
  const reportCount = metadata.reportCount != null ? String(metadata.reportCount) : null;
  const autoHidden = metadata.autoHidden === true;
  const timestamp = new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  });

  const detailRows = [
    { label: 'Alert type', value: alertLabel },
    { label: 'Content type', value: targetType },
    ...(reportCount ? [{ label: 'Total reports', value: reportCount }] : []),
    ...(autoHidden ? [{ label: 'Auto-hidden', value: 'Yes — content is hidden pending your review' }] : []),
    { label: 'Received at', value: timestamp },
  ];

  const detailRowsHtml = detailRows
    .map(
      (row) => `
        <tr>
          <td style="padding:10px 0;color:#9c8270;font-size:13px;font-weight:600;width:140px;vertical-align:top;">${escapeHtml(row.label)}</td>
          <td style="padding:10px 0;color:#3d2f1e;font-size:14px;line-height:1.5;">${escapeHtml(row.value)}</td>
        </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:#f5ebe0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5ebe0;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#fdf6ec;border:1px solid rgba(120,90,60,0.14);border-radius:18px;overflow:hidden;box-shadow:0 8px 32px rgba(61,47,30,0.08);">
          <tr>
            <td style="padding:28px 32px 20px;background:linear-gradient(135deg,#d4437a 0%,#e07840 100%);">
              <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.85);">TeaTalks Admin</p>
              <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;line-height:1.3;">${escapeHtml(title)}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px;">
              <span style="display:inline-block;padding:4px 12px;border-radius:999px;background:rgba(212,67,122,0.1);color:#be185d;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:18px;">${escapeHtml(alertLabel)}</span>
              <p style="margin:0 0 22px;font-size:15px;line-height:1.6;color:#6b5240;">${escapeHtml(message)}</p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top:1px solid rgba(120,90,60,0.12);border-bottom:1px solid rgba(120,90,60,0.12);margin-bottom:28px;">
                ${detailRowsHtml}
              </table>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto 20px;">
                <tr>
                  <td style="border-radius:999px;background:linear-gradient(135deg,#d4437a 0%,#e07840 100%);">
                    <a href="${escapeHtml(actionUrl)}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;letter-spacing:0.01em;">Review &amp; Take Action →</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;font-size:13px;color:#9c8270;line-height:1.5;text-align:center;">You'll be taken to the login page, then directly to the moderation queue.</p>
              <p style="margin:0;font-size:12px;color:#9c8270;line-height:1.5;text-align:center;word-break:break-all;">
                Or copy this link: <a href="${escapeHtml(actionUrl)}" style="color:#be185d;">${escapeHtml(actionUrl)}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 32px;background:#f8eeda;border-top:1px solid rgba(120,90,60,0.1);">
              <p style="margin:0;font-size:11px;color:#9c8270;line-height:1.5;text-align:center;">
                This is an automated alert from TeaTalks. Only the campus admin account can review flagged content.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildAdminApprovalEmailText({ title, message, type, metadata = {}, actionUrl }) {
  const alertLabel = getAlertTypeLabel(type);
  const lines = [
    `TeaTalks Admin Alert — ${title}`,
    '',
    message,
    '',
    `Alert type: ${alertLabel}`,
  ];

  if (metadata.targetType) lines.push(`Content type: ${metadata.targetType}`);
  if (metadata.reportCount != null) lines.push(`Total reports: ${metadata.reportCount}`);
  if (metadata.autoHidden) lines.push('Auto-hidden: Yes — content is hidden pending your review');
  lines.push('', `Review & take action: ${actionUrl}`, '', 'You will be asked to log in before reaching the moderation queue.');
  return lines.join('\n');
}

async function sendEmail({ toEmail, subject, text, html }) {
  const tx = getTransporter();
  let smtpError = null;
  let apiError = null;
  const preferApi = String(process.env.MAIL_PROVIDER_PRIORITY || 'api').toLowerCase() !== 'smtp';

  if (preferApi && process.env.BREVO_API_KEY) {
    try {
      const sentViaApi = await sendViaBrevoApi({ toEmail, subject, text, html });
      if (sentViaApi) return;
    } catch (err) {
      apiError = err;
      console.warn(`[mailService] Brevo API failed, trying SMTP fallback: ${err.message}`);
    }
  }

  if (tx) {
    try {
      await tx.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@teatalks.local',
        to: toEmail,
        subject,
        text,
        html,
      });
      return;
    } catch (err) {
      smtpError = err;
      console.warn(`[mailService] SMTP send failed, trying Brevo API fallback: ${err.message}`);
    }
  }

  if (!preferApi && process.env.BREVO_API_KEY) {
    try {
      const sentViaApi = await sendViaBrevoApi({ toEmail, subject, text, html });
      if (sentViaApi) return;
    } catch (err) {
      apiError = err;
      console.warn(`[mailService] Brevo API failed after SMTP attempt: ${err.message}`);
    }
  }

  if (smtpError && apiError) {
    throw new Error(`SMTP and Brevo API delivery both failed. SMTP: ${smtpError.message}. API: ${apiError.message}`);
  }

  if (smtpError) {
    throw smtpError;
  }

  if (apiError) {
    throw apiError;
  }

  if (!tx && !process.env.BREVO_API_KEY) {
    const err = new Error('Email delivery is not configured. Set SMTP or BREVO_API_KEY.');
    err.code = 'SMTP_NOT_CONFIGURED';
    throw err;
  }
}

async function sendOtpEmail({ toEmail, otp, subject, text, html, contextLabel }) {
  try {
    await sendEmail({ toEmail, subject, text, html });
  } catch (err) {
    if (err.code === 'SMTP_NOT_CONFIGURED') {
      handleMissingSmtpConfig(contextLabel, toEmail, otp);
      return;
    }
    throw err;
  }
}

async function sendAdminApprovalAlert({ toEmail, title, message, href = '/admin/flagged', type, metadata = {} }) {
  if (!toEmail || !title || !message) return;

  const actionUrl = buildAdminLoginUrl(href);
  const subject = `[TeaTalks Admin] ${title}`;
  const html = buildAdminApprovalEmailHtml({ title, message, type, metadata, actionUrl });
  const text = buildAdminApprovalEmailText({ title, message, type, metadata, actionUrl });

  const allowConsoleFallback = String(process.env.MAIL_ALLOW_CONSOLE_ADMIN_ALERT || '').toLowerCase() === 'true';

  try {
    await sendEmail({ toEmail, subject, text, html });
    console.log(`[mailService] Admin approval alert sent to ${toEmail} (${type || 'admin_alert'})`);
  } catch (err) {
    if (allowConsoleFallback) {
      console.warn(`[mailService] Admin email failed, console fallback enabled: ${err.message}`);
      console.log(`[mailService] Admin alert for ${toEmail}: ${title} — ${message}`);
      console.log(`[mailService] Action URL: ${actionUrl}`);
      return;
    }
    throw err;
  }
}

async function sendPasswordResetOtp(toEmail, otp) {
  const subject = 'TeaTalks Password Reset OTP';
  const text = `Your TeaTalks OTP is ${otp}. It expires in 10 minutes. If you did not request this, ignore this email.`;
  const html = `<p>Your TeaTalks OTP is <strong>${otp}</strong>.</p><p>It expires in 10 minutes.</p><p>If you did not request this, ignore this email.</p>`;
  await sendOtpEmail({
    toEmail,
    otp,
    subject,
    text,
    html,
    contextLabel: 'Password reset OTP',
  });
}

async function sendRegistrationOtp(toEmail, otp) {
  const subject = 'TeaTalks Registration OTP';
  const text = `Your TeaTalks signup OTP is ${otp}. It expires in 10 minutes. If you did not request this, ignore this email.`;
  const html = `<p>Your TeaTalks signup OTP is <strong>${otp}</strong>.</p><p>It expires in 10 minutes.</p><p>If you did not request this, ignore this email.</p>`;
  await sendOtpEmail({
    toEmail,
    otp,
    subject,
    text,
    html,
    contextLabel: 'Registration OTP',
  });
}

module.exports = {
  sendPasswordResetOtp,
  sendRegistrationOtp,
  sendAdminApprovalAlert,
  buildAdminLoginUrl,
};
