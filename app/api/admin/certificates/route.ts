import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import { Certificate } from '@/models';
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
    const search = searchParams.get('search');
    if (search) {
      query.$or = [
        { certificateNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const [certs, total] = await Promise.all([
      Certificate.find(query)
        .populate('studentId', 'name email')
        .populate('internshipId', 'title')
        .sort({ issuedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Certificate.countDocuments(query),
    ]);

    return paginatedResponse(certs, page, limit, total);
  } catch (error) {
    console.error('[ADMIN_CERTS_GET]', error);
    return errorResponse('Failed to fetch certificates', 500);
  }
}
