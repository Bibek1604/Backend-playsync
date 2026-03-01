// Load environment variables from .env file
require('dotenv').config();

// Import Nodemailer for SMTP email sending
const nodemailer = require('nodemailer');

// Read Gmail/SMTP configuration from environment variables
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
const EMAIL_HOST = process.env.EMAIL_HOST;
const EMAIL_PORT = process.env.EMAIL_PORT;
const EMAIL_SECURE = process.env.EMAIL_SECURE;

// Validate required environment variables at startup
if (!EMAIL_USER || !EMAIL_PASSWORD || !EMAIL_HOST || !EMAIL_PORT) {
  console.error(
    'Missing email env vars. Required: EMAIL_USER, EMAIL_PASSWORD, EMAIL_HOST, EMAIL_PORT'
  );
}

// Convert env values into proper Nodemailer option types
const port = Number(EMAIL_PORT || 587);
const secure = String(EMAIL_SECURE || 'false').toLowerCase() === 'true';

// Create and reuse a transporter (ready for imports across the backend)
const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port,
  secure,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  },
});

/**
 * Send an email using configured SMTP transporter.
 * @param {string} to - Recipient email address.
 * @param {string} subject - Email subject line.
 * @param {string} html - HTML body content.
 * @returns {Promise<import('nodemailer').SentMessageInfo | null>} Send result or null on failure.
 */
async function sendEmail(to, subject, html) {
  try {
    const info = await transporter.sendMail({
      from: `"PlaySync" <${EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    // Success log with Nodemailer message ID
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    // Failure log with full error details
    console.error('Failed to send email:', error);
    return null;
  }
}

// Export function to use from any part of a Node.js backend
module.exports = {
  sendEmail,
};
