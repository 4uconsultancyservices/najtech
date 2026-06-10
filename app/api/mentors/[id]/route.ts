import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import { Mentor } from '@/models';
import { auth } from '@/lib/auth/config';
import { successResponse, errorResponse } from '@/lib/api/helpers';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || !['admin', 'super_admin'].includes(session.user.role as string)) {
    return errorResponse('Unauthorized', 401);
  }
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const mentor = await Mentor.findByIdAndUpdate(id, body, { new: true, runValidators: true })
      .populate('userId', 'name email avatar');
    if (!mentor) return errorResponse('Mentor not found', 404);
    return successResponse(mentor, 'Mentor updated');
  } catch (error) {
    console.error('[MENTOR_PATCH]', error);
    return errorResponse('Failed to update mentor', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || !['admin', 'super_admin'].includes(session.user.role as string)) {
    return errorResponse('Unauthorized', 401);
  }
  try {
    await connectDB();
    const { id } = await params;
    const mentor = await Mentor.findByIdAndDelete(id);
    if (!mentor) return errorResponse('Mentor not found', 404);
    return successResponse(null, 'Mentor deleted');
  } catch (error) {
    console.error('[MENTOR_DELETE]', error);
    return errorResponse('Failed to delete mentor', 500);
  }
}