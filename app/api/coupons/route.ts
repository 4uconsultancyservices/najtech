import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import { Coupon } from '@/models';
import { auth } from '@/lib/auth/config';
import { successResponse, errorResponse } from '@/lib/api/helpers';
import { couponSchema } from '@/lib/validations';

export async function GET() {
  const session = await auth();
  if (!session?.user || !['admin', 'super_admin'].includes(session.user.role as string)) {
    return errorResponse('Unauthorized', 401);
  }
  try {
    await connectDB();
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
    return successResponse(coupons);
  } catch (error) {
    console.error('[COUPONS_GET]', error);
    return errorResponse('Failed to fetch coupons', 500);
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
    const parsed = couponSchema.safeParse(body);
    if (!parsed.success) return errorResponse(parsed.error.errors[0].message, 422);

    const existing = await Coupon.findOne({ code: parsed.data.code.toUpperCase() });
    if (existing) return errorResponse('Coupon code already exists', 409);

    const coupon = await Coupon.create({ ...parsed.data, code: parsed.data.code.toUpperCase() });
    return successResponse(coupon, 'Coupon created', 201);
  } catch (error) {
    console.error('[COUPONS_POST]', error);
    return errorResponse('Failed to create coupon', 500);
  }
}
