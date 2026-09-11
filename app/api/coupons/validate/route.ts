import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import { Coupon } from '@/models';
import { successResponse, errorResponse } from '@/lib/api/helpers';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { code, internshipId, amount = 0 } = await request.json();

    if (!code || typeof code !== 'string') {
      return errorResponse('Coupon code is required', 400);
    }

    const cleanCode = code.trim().toUpperCase();

    const coupon = await Coupon.findOne({
      code: cleanCode,
      isActive: true,
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() },
    });

    if (!coupon) {
      return errorResponse('Invalid or expired coupon code', 404);
    }

    // Usage limit check
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return errorResponse('This coupon has reached its maximum usage limit', 400);
    }

    // Minimum order amount check
    if (coupon.minOrderAmount && amount < coupon.minOrderAmount) {
      return errorResponse(`Minimum order amount for this coupon is ₹${coupon.minOrderAmount}`, 400);
    }

    // Internship eligibility check (if restricted to specific internships)
    if (coupon.internships && coupon.internships.length > 0 && internshipId) {
      const isEligible = coupon.internships.some((id: any) => id.toString() === internshipId);
      if (!isEligible) {
        return errorResponse('This coupon is not valid for the selected internship', 400);
      }
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (coupon.type === 'percentage') {
      discountAmount = (amount * coupon.value) / 100;
      if (coupon.maxDiscount) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscount);
      }
    } else {
      discountAmount = Math.min(coupon.value, amount);
    }

    const finalAmount = Math.max(0, amount - discountAmount);

    return successResponse({
      valid: true,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discountAmount: Math.round(discountAmount),
      finalAmount: Math.round(finalAmount),
      couponId: coupon._id,
    }, `Coupon "${coupon.code}" applied successfully!`);
  } catch (error) {
    console.error('[COUPON_VALIDATE_POST]', error);
    return errorResponse('Failed to validate coupon', 500);
  }
}
