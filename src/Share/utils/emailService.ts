import nodemailer from "nodemailer";
import { logger } from "./logger";

// Email configuration interface
interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

// Nodemailer transporter configuration
const createTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    logger.error("Email credentials not configured in environment variables");
    throw new Error("Email service is not properly configured");
  }

  return nodemailer.createTransporter({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPass, // Use Gmail App Password, not regular password
    },
    // Enable secure connection
    secure: true,
    // Connection timeout
    connectionTimeout: 10000,
  });
};

/**
 * Send email using Nodemailer
 * @param options - Email options (to, subject, text, html)
 * @returns Promise<boolean> - Returns true if email sent successfully
 */
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    const transporter = createTransporter();

    // Verify transporter configuration
    await transporter.verify();

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'PlaySync'}" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    logger.info(`Email sent successfully to ${options.to}. MessageId: ${info.messageId}`);
    return true;
  } catch (error) {
    logger.error("Failed to send email:", error);
    // Don't throw error to prevent exposing internal details to users
    return false;
  }
};

/**
 * Send OTP email for password reset
 * @param email - Recipient email address
 * @param otp - 6-digit OTP code
 * @param fullName - User's full name
 * @returns Promise<boolean>
 */
export const sendPasswordResetOTP = async (
  email: string,
  otp: string,
  fullName: string
): Promise<boolean> => {
  const subject = "Password Reset OTP - PlaySync";
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background: #f9f9f9;
            border-radius: 8px;
            padding: 30px;
            border: 1px solid #e0e0e0;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .otp-box {
            background: #fff;
            border: 2px dashed #4CAF50;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
          }
          .otp-code {
            font-size: 32px;
            font-weight: bold;
            color: #4CAF50;
            letter-spacing: 5px;
            font-family: 'Courier New', monospace;
          }
          .warning {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 12px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="color: #4CAF50; margin: 0;">Password Reset Request</h2>
          </div>
          
          <p>Hello <strong>${fullName}</strong>,</p>
          
          <p>You recently requested to reset your password for your PlaySync account. Use the OTP code below to proceed:</p>
          
          <div class="otp-box">
            <p style="margin: 0; color: #666; font-size: 14px;">Your OTP Code</p>
            <div class="otp-code">${otp}</div>
            <p style="margin: 10px 0 0 0; color: #666; font-size: 12px;">Valid for 10 minutes</p>
          </div>
          
          <div class="warning">
            <strong>⚠️ Security Notice:</strong>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>This OTP is valid for <strong>10 minutes</strong> only</li>
              <li>Never share this code with anyone</li>
              <li>If you didn't request this, please ignore this email</li>
            </ul>
          </div>
          
          <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} PlaySync. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
    Hello ${fullName},

    You recently requested to reset your password for your PlaySync account.
    
    Your OTP Code: ${otp}
    
    This code is valid for 10 minutes only.
    
    Security Notice:
    - Never share this code with anyone
    - If you didn't request this, please ignore this email
    
    © ${new Date().getFullYear()} PlaySync. All rights reserved.
  `;

  return await sendEmail({
    to: email,
    subject,
    html,
    text,
  });
};
