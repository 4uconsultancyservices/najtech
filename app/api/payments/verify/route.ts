import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import { Order, Enrollment, Coupon, Payment, Notification } from '@/models';
import Internship from '@/models/Internship';
import User from '@/models/User';
import { auth } from '@/lib/auth/config';
import { verifyRazorpaySignature } from '@/lib/payments';
import { successResponse, errorResponse } from '@/lib/api/helpers';
import { sendEmail, enrollmentEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return errorResponse('Unauthorized', 401);

  try {
    await connectDB();
    const {
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      provider = 'razorpay',
    } = await request.json();

    const order = await Order.findById(orderId);
    if (!order) return errorResponse('Order not found', 404);
    if (order.studentId.toString() !== session.user.id) return errorResponse('Unauthorized', 401);
    if (order.status !== 'pending') return errorResponse('Order already processed', 400);

    let isValid = false;
    let actualPaymentId = razorpayPaymentId || `pay_demo_${Date.now()}`;
    let actualOrderId = razorpayOrderId || `order_demo_${Date.now()}`;

    if (provider === 'razorpay') {
      isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    } else if (provider === 'test' || provider === 'demo' || provider === 'free') {
      isValid = true;
    }

    if (!isValid) {
      await Order.findByIdAndUpdate(orderId, { status: 'cancelled' });
      return errorResponse('Payment verification failed', 400);
    }

    // Update order
    await Order.findByIdAndUpdate(orderId, {
      status: 'paid',
      paymentId: actualPaymentId,
    });

    // Record payment
    await Payment.create({
      orderId: order._id,
      studentId: session.user.id,
      provider,
      providerId: actualPaymentId,
      providerOrderId: actualOrderId,
      amount: order.finalAmount,
      currency: order.currency,
      status: 'success',
    });

    // Update coupon usage
    if (order.couponId) {
      await Coupon.findByIdAndUpdate(order.couponId, { $inc: { usageCount: 1 } });
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      studentId: session.user.id,
      internshipId: order.internshipId,
      orderId: order._id,
      status: 'active',
      startDate: new Date(),
    });

    // Update internship enrollment count
    await Internship.findByIdAndUpdate(order.internshipId, {
      $inc: { enrollmentCount: 1 },
    });

    // Send notification
    await Notification.create({
      userId: session.user.id,
      title: 'Enrollment Confirmed!',
      message: 'You have successfully enrolled in the internship.',
      type: 'success',
      link: '/dashboard/my-internships',
    });

    // Send email (non-blocking)
    const user = await User.findById(session.user.id);
    const internship = await Internship.findById(order.internshipId);
    if (user && internship) {
      sendEmail(
        enrollmentEmail(user.name, user.email, internship.title, order.orderNumber)
      ).catch(console.error);
    }

    return successResponse(
      { enrollmentId: enrollment._id, orderId: order._id },
      'Payment successful! You are now enrolled.'
    );
  } catch (error) {
    console.error('[PAYMENT_VERIFY]', error);
    return errorResponse('Payment verification failed', 500);
  }
}
