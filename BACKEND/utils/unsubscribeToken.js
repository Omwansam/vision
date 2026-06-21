const crypto = require('crypto');
const config = require('../config/env');

function signUnsubscribeToken(list, email) {
  const secret = config.JWT_SECRET || 'dev-unsubscribe-secret';
  const payload = `${list}:${email.trim().toLowerCase()}`;
  return crypto.createHmac('sha256', secret).update(payload).digest('hex').slice(0, 32);
}

function verifyUnsubscribeToken(list, email, token) {
  if (!list || !email || !token) return false;
  const expected = signUnsubscribeToken(list, email);
  try {
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  } catch {
    return false;
  }
}

function buildUnsubscribeUrl(list, email) {
  const base = config.BACKEND_URL.replace(/\/$/, '');
  const token = signUnsubscribeToken(list, email);
  const params = new URLSearchParams({
    list,
    email: email.trim().toLowerCase(),
    token,
  });
  return `${base}/api/v1/notifications/unsubscribe?${params.toString()}`;
}

module.exports = {
  signUnsubscribeToken,
  verifyUnsubscribeToken,
  buildUnsubscribeUrl,
};
