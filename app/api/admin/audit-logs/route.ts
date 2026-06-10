import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import { AuditLog } from '@/models';
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

    const [logs, total] = await Promise.all([
      AuditLog.find()
        .populate('userId', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(),
    ]);

    return paginatedResponse(logs, page, limit, total);
  } catch (error) {
    console.error('[AUDIT_LOGS_GET]', error);
    return errorResponse('Failed to fetch audit logs', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const log = await AuditLog.create(body);
    return successResponse(log, 'Log created', 201);
  } catch (error) {
    console.error('[AUDIT_LOG_POST]', error);
    return errorResponse('Failed to create log', 500);
  }
}
