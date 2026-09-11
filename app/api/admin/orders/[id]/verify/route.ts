import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import { Order, Enrollment, Coupon, Payment, Notification } from '@/models';
import Internship from '@/models/Internship';
import User from '@/models/User';
import { auth } from '@/lib/auth/config';
import { successResponse, errorResponse } from '@/lib/api/helpers';
import { sendEmail, enrollmentEmail } from '@/lib/email';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || !['admin', 'super_admin'].includes(session.user.role as string)) {
    return errorResponse('Unauthorized', 401);
  }

  try {
    await connectDB();
    const { id } = await params;

    const order = await Order.findById(id);
    if (!order) return errorResponse('Order not found', 404);

    if (order.status === 'paid') {
      return errorResponse('Order is already marked as paid and verified', 400);
    }

    const providerId = order.utrNumber || `pay_verified_${Date.now()}`;

    // 1. Update order status to paid
    await Order.findByIdAndUpdate(id, {
      status: 'paid',
      paymentId: providerId,
      verifiedBy: session.user.id,
      verifiedAt: new Date(),
    });

    // 2. Create payment record
    await Payment.create({
      orderId: order._id,
      studentId: order.studentId,
      provider: order.paymentProvider || 'upi_qr',
      providerId,
      providerOrderId: order.orderNumber,
      amount: order.finalAmount,
      currency: order.currency,
      status: 'success',
      method: order.senderUpiId ? `UPI (${order.senderUpiId})` : 'Manual Verification',
    });

    // 3. Update coupon usage
    if (order.couponId) {
      await Coupon.findByIdAndUpdate(order.couponId, { $inc: { usageCount: 1 } });
    }

    // 4. Create enrollment (idempotent check)
    let enrollment = await Enrollment.findOne({
      studentId: order.studentId,
      internshipId: order.internshipId,
    });

    if (!enrollment) {
      enrollment = await Enrollment.create({
        studentId: order.studentId,
        internshipId: order.internshipId,
        orderId: order._id,
        status: 'active',
        startDate: new Date(),
      });

      // Update internship enrollment count
      await Internship.findByIdAndUpdate(order.internshipId, {
        $inc: { enrollmentCount: 1 },
      });
    }

    // 5. Send notification to student
    await Notification.create({
      userId: order.studentId,
      title: 'Payment Verified & Enrollment Active!',
      message: `Your payment for order ${order.orderNumber} (UTR: ${order.utrNumber || 'N/A'}) has been verified. Access your internship dashboard now!`,
      type: 'success',
      link: '/my-internships',
    });

    // 6. Send email notification (non-blocking)
    const user = await User.findById(order.studentId);
    const internship = await Internship.findById(order.internshipId);
    if (user && internship) {
      sendEmail(
        enrollmentEmail(user.name, user.email, internship.title, order.orderNumber)
      ).catch(console.error);
    }

    return successResponse(
      { orderId: order._id, enrollmentId: enrollment._id },
      'Payment verified successfully and student enrolled!'
    );
  } catch (error) {
    console.error('[ADMIN_ORDER_VERIFY]', error);
    return errorResponse('Failed to verify order payment', 500);
  }
}
