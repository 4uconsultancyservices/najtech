import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import { Order } from '@/models';
import { auth } from '@/lib/auth/config';
import { successResponse, errorResponse } from '@/lib/api/helpers';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return errorResponse('Unauthorized', 401);

  try {
    await connectDB();

    const orders = await Order.find({ studentId: session.user.id })
      .populate('internshipId', 'title thumbnail')
      .populate('couponId', 'code')
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(orders);
  } catch (error) {
    console.error('[PAYMENT_HISTORY]', error);
    return errorResponse('Failed to fetch payment history', 500);
  }
}
