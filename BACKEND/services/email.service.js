const nodemailer = require('nodemailer');
const config = require('../config/env');

let transporter;

function isEmailConfigured() {
  return Boolean(config.SMTP_HOST && config.SMTP_USER && config.SMTP_PASS);
}

function getTransporter() {
  if (!isEmailConfigured()) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.SMTP_HOST,
      port: config.SMTP_PORT,
      secure: config.SMTP_SECURE,
      auth: {
        user: config.SMTP_USER,
        pass: config.SMTP_PASS,
      },
    });
  }
  return transporter;
}

function formatFrom() {
  const address = config.SMTP_FROM || config.SMTP_USER;
  return `"${config.SMTP_FROM_NAME}" <${address}>`;
}

async function sendEmail({ to, subject, html, text, replyTo }) {
  if (!isEmailConfigured()) {
    if (config.NODE_ENV === 'development') {
      console.warn('[email] SMTP not configured — skipped:', { to, subject });
    }
    return { skipped: true, messageId: null };
  }

  const transport = getTransporter();
  const info = await transport.sendMail({
    from: formatFrom(),
    to,
    subject,
    html,
    text: text || stripHtml(html),
    replyTo,
  });

  return { skipped: false, messageId: info.messageId };
}

function stripHtml(html = '') {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function dispatchEmail(task) {
  Promise.resolve()
    .then(task)
    .catch((err) => {
      console.error('[email] delivery failed:', err.message);
    });
}

module.exports = {
  isEmailConfigured,
  sendEmail,
  dispatchEmail,
  formatFrom,
};
