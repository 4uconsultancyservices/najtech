import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import { Mentor } from '@/models';
import { auth } from '@/lib/auth/config';
import { successResponse, errorResponse, paginatedResponse, getPaginationParams } from '@/lib/api/helpers';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);

    const query: Record<string, unknown> = { isActive: true };
    const search = searchParams.get('search');
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { specialization: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const [mentors, total] = await Promise.all([
      Mentor.find(query)
        .populate('userId', 'name email avatar')
        .sort({ rating: -1, reviewCount: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Mentor.countDocuments(query),
    ]);

    return paginatedResponse(mentors, page, limit, total);
  } catch (error) {
    console.error('[MENTORS_GET]', error);
    return errorResponse('Failed to fetch mentors', 500);
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || !['admin', 'super_admin'].includes(session.user.role as string)) {
    return errorResponse('Unauthorized', 401);
  }

  try {
    await connectDB();
    const body = await request.json();
    const mentor = await Mentor.create(body);
    return successResponse(mentor, 'Mentor created', 201);
  } catch (error) {
    console.error('[MENTORS_POST]', error);
    return errorResponse('Failed to create mentor', 500);
  }
}
