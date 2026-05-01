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
    connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT_MS || 8000),
    greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT_MS || 8000),
    socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT_MS || 10000),
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
  const apiTimeoutMs = Number(process.env.BREVO_API_TIMEOUT_MS || 8000);
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

async function sendOtpEmail({ toEmail, otp, subject, text, html, contextLabel }) {
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

  if (!tx) {
    handleMissingSmtpConfig(contextLabel, toEmail, otp);
    return;
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
};
