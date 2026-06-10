import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import User from '@/models/User';
import { registerSchema } from '@/lib/validations';
import { successResponse, errorResponse, rateLimit } from '@/lib/api/helpers';
import { sendEmail, welcomeEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (!rateLimit(`register:${ip}`, 5, 60_000)) {
    return errorResponse('Too many requests. Please try again later.', 429);
  }

  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message, 422);
    }

    const { name, email, phone, password } = parsed.data;

    await connectDB();

    const existing = await User.findOne({ email });
    if (existing) {
      return errorResponse('An account with this email already exists', 409);
    }

    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: 'student',
      isEmailVerified: false,
    });

    // Send welcome email (non-blocking)
    sendEmail(welcomeEmail(name, email)).catch(console.error);

    return successResponse(
      { id: user._id, name: user.name, email: user.email },
      'Account created successfully',
      201
    );
  } catch (error) {
    console.error('[REGISTER_ERROR]', error);
    return errorResponse('Failed to create account', 500);
  }
}
