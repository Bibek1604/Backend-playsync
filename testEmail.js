// Load environment variables from .env file
require('dotenv').config();

// Import Nodemailer to send emails
const nodemailer = require('nodemailer');

// Read required email configuration from environment variables
const {
  EMAIL_USER,
  EMAIL_PASSWORD,
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_SECURE,
} = process.env;

// Validate required variables before trying to send email
if (!EMAIL_USER || !EMAIL_PASSWORD || !EMAIL_HOST || !EMAIL_PORT) {
  console.error('Missing required environment variables. Please check .env file.');
  console.error('Required: EMAIL_USER, EMAIL_PASSWORD, EMAIL_HOST, EMAIL_PORT');
  process.exit(1);
}

// Convert string values from .env to proper types for Nodemailer
const port = Number(EMAIL_PORT);
const secure = String(EMAIL_SECURE).toLowerCase() === 'true';

// Create a transporter object using SMTP configuration
const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port,
  secure,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  },
});

// Async function to send a test email
async function sendTestEmail() {
  try {
    // Send email to your own email address for testing
    const info = await transporter.sendMail({
      from: `"PlaySync Test" <${EMAIL_USER}>`,
      to: EMAIL_USER,
      subject: 'Test Email from Node.js',
      html: `
        <h2>Test Email</h2>
        <p>This is a test email sent from a Node.js script using Nodemailer.</p>
        <p>If you received this, your SMTP setup is working correctly ✅</p>
      `,
    });

    // Log success with message ID
    console.log('Email sent:', info.messageId);
  } catch (error) {
    // Log full error details if sending fails
    console.error('Failed to send email:', error);
  }
}

// Run the test sender function directly when executing this file
sendTestEmail();
