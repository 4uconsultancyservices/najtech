import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import { Enrollment } from '@/models';
import { auth } from '@/lib/auth/config';
import { successResponse, errorResponse, paginatedResponse, getPaginationParams } from '@/lib/api/helpers';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return errorResponse('Unauthorized', 401);

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const role = session.user.role as string;

    const query: Record<string, unknown> = {};
    if (role === 'student') {
      query.studentId = session.user.id;
    } else if (!['admin', 'super_admin'].includes(role)) {
      return errorResponse('Unauthorized', 401);
    }

    const status = searchParams.get('status');
    if (status) query.status = status;

    const [enrollments, total] = await Promise.all([
      Enrollment.find(query)
        .populate('internshipId', 'title thumbnail duration slug')
        .populate('studentId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Enrollment.countDocuments(query),
    ]);

    return paginatedResponse(enrollments, page, limit, total);
  } catch (error) {
    console.error('[ENROLLMENTS_GET]', error);
    return errorResponse('Failed to fetch enrollments', 500);
  }
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return errorResponse('Unauthorized', 401);

  try {
    await connectDB();
    const { enrollmentId, completedLesson, progress } = await request.json();

    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment) return errorResponse('Enrollment not found', 404);
    if (enrollment.studentId.toString() !== session.user.id) {
      return errorResponse('Unauthorized', 401);
    }

    const updateData: Record<string, unknown> = {};
    if (completedLesson && !enrollment.completedLessons.includes(completedLesson)) {
      updateData.$addToSet = { completedLessons: completedLesson };
    }
    if (progress !== undefined) {
      updateData.progress = Math.min(100, Math.max(0, progress));
    }

    const updated = await Enrollment.findByIdAndUpdate(enrollmentId, updateData, { new: true });
    return successResponse(updated, 'Progress updated');
  } catch (error) {
    console.error('[ENROLLMENT_PATCH]', error);
    return errorResponse('Failed to update enrollment', 500);
  }
}
