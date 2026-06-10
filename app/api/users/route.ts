import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import User from '@/models/User';
import { auth } from '@/lib/auth/config';
import { successResponse, errorResponse, paginatedResponse, getPaginationParams } from '@/lib/api/helpers';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user || !['admin', 'super_admin'].includes(session.user.role as string)) {
    return errorResponse('Unauthorized', 401);
  }

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);

    const query: Record<string, unknown> = {};
    const role = searchParams.get('role');
    if (role) query.role = role;
    const search = searchParams.get('search');
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    const isActive = searchParams.get('isActive');
    if (isActive !== null && isActive !== '') query.isActive = isActive === 'true';

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(query),
    ]);

    return paginatedResponse(users, page, limit, total);
  } catch (error) {
    console.error('[USERS_GET]', error);
    return errorResponse('Failed to fetch users', 500);
  }
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user || !['admin', 'super_admin'].includes(session.user.role as string)) {
    return errorResponse('Unauthorized', 401);
  }

  try {
    await connectDB();
    const { userId, ...updateData } = await request.json();

    // Prevent role escalation
    if (updateData.role === 'super_admin' && session.user.role !== 'super_admin') {
      return errorResponse('Cannot assign super_admin role', 403);
    }

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true });
    if (!user) return errorResponse('User not found', 404);

    return successResponse(user, 'User updated');
  } catch (error) {
    console.error('[USERS_PATCH]', error);
    return errorResponse('Failed to update user', 500);
  }
}
