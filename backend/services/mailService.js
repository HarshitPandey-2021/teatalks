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
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
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
  });

  if (!response.ok) {
    const payload = await response.text();
    const err = new Error(`Brevo API send failed (${response.status}): ${payload}`);
    err.code = 'BREVO_API_SEND_FAILED';
    throw err;
  }

  return true;
}

async function sendOtpEmail({ toEmail, otp, subject, text, html, contextLabel }) {
  const sentViaApi = await sendViaBrevoApi({ toEmail, subject, text, html });
  if (sentViaApi) return;

  const tx = getTransporter();
  if (!tx) {
    handleMissingSmtpConfig(contextLabel, toEmail, otp);
    return;
  }

  await tx.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@teatalks.local',
    to: toEmail,
    subject,
    text,
    html,
  });
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
};
