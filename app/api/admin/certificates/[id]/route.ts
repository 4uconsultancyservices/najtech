import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import { Certificate } from '@/models';
import { auth } from '@/lib/auth/config';
import { successResponse, errorResponse } from '@/lib/api/helpers';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || !['admin', 'super_admin'].includes(session.user.role as string)) {
    return errorResponse('Unauthorized', 401);
  }

  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const cert = await Certificate.findByIdAndUpdate(id, body, { new: true });
    if (!cert) return errorResponse('Certificate not found', 404);
    return successResponse(cert, 'Certificate updated');
  } catch (error) {
    console.error('[CERT_PATCH]', error);
    return errorResponse('Failed to update certificate', 500);
  }
}
