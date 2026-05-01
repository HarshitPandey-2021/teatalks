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
  if (process.env.NODE_ENV === 'production') {
    const err = new Error(message);
    err.code = 'SMTP_NOT_CONFIGURED';
    throw err;
  }

  console.warn(`[mailService] ${message}`);
  console.log(`${contextLabel} for ${toEmail}: ${otp}`);
}

async function sendPasswordResetOtp(toEmail, otp) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@teatalks.local';
  const subject = 'TeaTalks Password Reset OTP';
  const text = `Your TeaTalks OTP is ${otp}. It expires in 10 minutes. If you did not request this, ignore this email.`;
  const html = `<p>Your TeaTalks OTP is <strong>${otp}</strong>.</p><p>It expires in 10 minutes.</p><p>If you did not request this, ignore this email.</p>`;

  const tx = getTransporter();
  if (!tx) {
    handleMissingSmtpConfig('Password reset OTP', toEmail, otp);
    return;
  }

  await tx.sendMail({
    from,
    to: toEmail,
    subject,
    text,
    html,
  });
}

async function sendRegistrationOtp(toEmail, otp) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@teatalks.local';
  const subject = 'TeaTalks Registration OTP';
  const text = `Your TeaTalks signup OTP is ${otp}. It expires in 10 minutes. If you did not request this, ignore this email.`;
  const html = `<p>Your TeaTalks signup OTP is <strong>${otp}</strong>.</p><p>It expires in 10 minutes.</p><p>If you did not request this, ignore this email.</p>`;

  const tx = getTransporter();
  if (!tx) {
    handleMissingSmtpConfig('Registration OTP', toEmail, otp);
    return;
  }

  await tx.sendMail({
    from,
    to: toEmail,
    subject,
    text,
    html,
  });
}

module.exports = {
  sendPasswordResetOtp,
  sendRegistrationOtp,
};
