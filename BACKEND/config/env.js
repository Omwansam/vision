require("dotenv").config();

module.exports = {
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  /** Comma-separated allowed origins for CORS (ngo-website + admin-client). */
  FRONTEND_URL: process.env.FRONTEND_URL,
  FRONTEND_ORIGINS: process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(",").map((s) => s.trim()).filter(Boolean)
    : ["http://localhost:5173", "http://localhost:5174"],
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  APPLE_CLIENT_ID: process.env.APPLE_CLIENT_ID,
  // Stripe payments for investor investments
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  // SMTP / email (nodemailer)
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: parseInt(process.env.SMTP_PORT, 10) || 587,
  SMTP_SECURE: process.env.SMTP_SECURE === 'true',
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  SMTP_FROM: process.env.SMTP_FROM,
  SMTP_FROM_NAME: process.env.SMTP_FROM_NAME || 'Vision Mentors Group',
  /** Fallback inbox when site settings email is unset */
  ADMIN_NOTIFICATION_EMAIL: process.env.ADMIN_NOTIFICATION_EMAIL,
  /** Public website URL used in email content links */
  WEBSITE_URL: process.env.WEBSITE_URL || 'http://localhost:5173',
  /** Backend base URL for API links in emails (unsubscribe, etc.) */
  BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:5000',
};