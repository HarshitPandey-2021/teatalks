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

async function sendPasswordResetOtp(toEmail, otp) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@teatalks.local';
  const subject = 'TeaTalks Password Reset OTP';
  const text = `Your TeaTalks OTP is ${otp}. It expires in 10 minutes. If you did not request this, ignore this email.`;
  const html = `<p>Your TeaTalks OTP is <strong>${otp}</strong>.</p><p>It expires in 10 minutes.</p><p>If you did not request this, ignore this email.</p>`;

  const tx = getTransporter();
  if (!tx) {
    console.log(`Password reset OTP for ${toEmail}: ${otp}`);
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
};
