import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import Internship from '@/models/Internship';
import { Order, Coupon } from '@/models';
import { auth } from '@/lib/auth/config';
import { createRazorpayOrder } from '@/lib/payments';
import { successResponse, errorResponse } from '@/lib/api/helpers';
import { generateOrderNumber } from '@/lib/auth/helpers';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return errorResponse('Please login to continue', 401);

  try {
    await connectDB();
    const {
      internshipId,
      couponCode,
      provider = 'razorpay',
      utrNumber,
      senderUpiId,
      paymentNotes,
    } = await request.json();

    if (!internshipId) return errorResponse('Internship ID is required', 400);

    if (provider === 'upi_qr' && !utrNumber?.trim()) {
      return errorResponse('UTR / Transaction Reference Number is required for UPI QR payments', 400);
    }

    const internship = await Internship.findById(internshipId);
    if (!internship || internship.status !== 'published') {
      return errorResponse('Internship not found or unavailable', 404);
    }

    let amount = internship.discountPrice || internship.price;
    let discountAmount = 0;
    let coupon = null;

    // Apply coupon
    if (couponCode) {
      coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
        validFrom: { $lte: new Date() },
        validUntil: { $gte: new Date() },
        $or: [
          { internships: { $size: 0 } },
          { internships: internshipId },
        ],
      });

      if (!coupon) return errorResponse('Invalid or expired coupon', 400);

      if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        return errorResponse('Coupon usage limit reached', 400);
      }

      if (coupon.minOrderAmount && amount < coupon.minOrderAmount) {
        return errorResponse(`Minimum order amount is ₹${coupon.minOrderAmount}`, 400);
      }

      if (coupon.type === 'percentage') {
        discountAmount = (amount * coupon.value) / 100;
        if (coupon.maxDiscount) discountAmount = Math.min(discountAmount, coupon.maxDiscount);
      } else {
        discountAmount = Math.min(coupon.value, amount);
      }
    }

    const finalAmount = Math.max(0, amount - discountAmount);
    const orderNumber = generateOrderNumber();

    // Create order in DB
    const dbOrder = await Order.create({
      orderNumber,
      studentId: session.user.id,
      internshipId,
      amount,
      currency: internship.currency || 'INR',
      status: 'pending',
      paymentProvider: provider,
      utrNumber: utrNumber?.trim(),
      senderUpiId: senderUpiId?.trim(),
      paymentNotes: paymentNotes?.trim(),
      couponId: coupon?._id,
      discountAmount,
      finalAmount,
    });

    // Create Razorpay order
    if (provider === 'razorpay') {
      const razorpayOrder = await createRazorpayOrder(finalAmount, 'INR', orderNumber);
      return successResponse({
        orderId: dbOrder._id,
        orderNumber,
        razorpayOrderId: razorpayOrder.id,
        amount: finalAmount,
        currency: 'INR',
        keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      });
    }

    return successResponse({
      orderId: dbOrder._id,
      orderNumber,
      amount: finalAmount,
    });
  } catch (error) {
    console.error('[PAYMENT_CREATE]', error);
    return errorResponse('Failed to create payment order', 500);
  }
}
