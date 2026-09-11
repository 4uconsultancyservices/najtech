import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import { Order } from '@/models';
import { auth } from '@/lib/auth/config';
import { successResponse, errorResponse, getPaginationParams } from '@/lib/api/helpers';

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
    const status = searchParams.get('status');
    if (status) query.status = status;

    const search = searchParams.get('search');
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { utrNumber: { $regex: search, $options: 'i' } },
        { senderUpiId: { $regex: search, $options: 'i' } },
      ];
    }

    const [orders, total, revenueData] = await Promise.all([
      Order.find(query)
        .populate('studentId', 'name email role')
        .populate('internshipId', 'title slug thumbnail duration price discountPrice')
        .populate('couponId', 'code value type')
        .populate('verifiedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(query),
      Order.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$finalAmount' } } },
      ]),
    ]);

    return successResponse({
      orders,
      total,
      pages: Math.ceil(total / limit),
      totalRevenue: revenueData[0]?.total || 0,
    });
  } catch (error) {
    console.error('[ADMIN_ORDERS_GET]', error);
    return errorResponse('Failed to fetch orders', 500);
  }
}
