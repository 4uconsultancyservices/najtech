import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import User from '@/models/User';
import { successResponse, errorResponse, rateLimit } from '@/lib/api/helpers';
import { sendEmail, passwordResetEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (!rateLimit(`forgot-pw:${ip}`, 3, 60_000)) {
    return errorResponse('Too many requests. Please try again in a minute.', 429);
  }

  try {
    const { email } = await request.json();
    if (!email) return errorResponse('Email is required', 400);

    await connectDB();
    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return success to prevent email enumeration
    if (!user) {
      return successResponse(null, 'If an account exists, a reset link has been sent.');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await User.findByIdAndUpdate(user._id, {
      resetToken: crypto.createHash('sha256').update(resetToken).digest('hex'),
      resetTokenExpiry,
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
    await sendEmail(passwordResetEmail(user.name, user.email, resetUrl));

    return successResponse(null, 'If an account exists, a reset link has been sent.');
  } catch (error) {
    console.error('[FORGOT_PW]', error);
    return errorResponse('Failed to process request', 500);
  }
}
