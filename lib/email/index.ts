import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
      text,
    });
    return { success: true };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error };
  }
}

export function welcomeEmail(name: string, email: string) {
  return {
    to: email,
    subject: `Welcome to NajTech, ${name}!`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6366f1;">Welcome to NajTech!</h1>
        <p>Hi ${name},</p>
        <p>Thank you for joining NajTech. Start your internship journey today!</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/internships" 
           style="display:inline-block;background:#6366f1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;">
          Explore Internships
        </a>
      </div>
    `,
  };
}

export function otpEmail(name: string, email: string, otp: string) {
  return {
    to: email,
    subject: 'Your OTP for NajTech',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6366f1;">OTP Verification</h1>
        <p>Hi ${name},</p>
        <p>Your OTP is:</p>
        <div style="font-size: 32px; font-weight: bold; color: #6366f1; letter-spacing: 8px; text-align: center; padding: 20px; background: #f3f4f6; border-radius: 8px;">
          ${otp}
        </div>
        <p>This OTP expires in 10 minutes.</p>
      </div>
    `,
  };
}

export function enrollmentEmail(name: string, email: string, internshipTitle: string, orderNumber: string) {
  return {
    to: email,
    subject: `Enrollment Confirmed: ${internshipTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6366f1;">Enrollment Confirmed!</h1>
        <p>Hi ${name},</p>
        <p>You are now enrolled in <strong>${internshipTitle}</strong>.</p>
        <p>Order Number: <strong>${orderNumber}</strong></p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
           style="display:inline-block;background:#6366f1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;">
          Go to Dashboard
        </a>
      </div>
    `,
  };
}

export function certificateEmail(name: string, email: string, internshipTitle: string, certificateUrl: string) {
  return {
    to: email,
    subject: `Certificate Issued: ${internshipTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6366f1;">Congratulations!</h1>
        <p>Hi ${name},</p>
        <p>You have successfully completed <strong>${internshipTitle}</strong>.</p>
        <p>Your certificate is ready for download.</p>
        <a href="${certificateUrl}" 
           style="display:inline-block;background:#6366f1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;">
          Download Certificate
        </a>
      </div>
    `,
  };
}

export function passwordResetEmail(name: string, email: string, resetUrl: string) {
  return {
    to: email,
    subject: 'Reset Your NajTech Password',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6366f1;">Password Reset</h1>
        <p>Hi ${name},</p>
        <p>Click below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" 
           style="display:inline-block;background:#6366f1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;">
          Reset Password
        </a>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `,
  };
}
