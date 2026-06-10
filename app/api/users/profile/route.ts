import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import User from '@/models/User';
import { auth } from '@/lib/auth/config';
import { successResponse, errorResponse } from '@/lib/api/helpers';
import { profileUpdateSchema } from '@/lib/validations';

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return errorResponse('Unauthorized', 401);

  try {
    await connectDB();
    const body = await request.json();
    const parsed = profileUpdateSchema.safeParse(body);

    if (!parsed.success) return errorResponse(parsed.error.errors[0].message, 422);

    const user = await User.findByIdAndUpdate(
      session.user.id,
      { $set: parsed.data },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) return errorResponse('User not found', 404);

    return successResponse(user, 'Profile updated');
  } catch (error) {
    console.error('[PROFILE_PATCH]', error);
    return errorResponse('Failed to update profile', 500);
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user) return errorResponse('Unauthorized', 401);

  try {
    await connectDB();
    const user = await User.findById(session.user.id).select('-password').lean();
    if (!user) return errorResponse('User not found', 404);
    return successResponse(user);
  } catch (error) {
    console.error('[PROFILE_GET]', error);
    return errorResponse('Failed to fetch profile', 500);
  }
}
