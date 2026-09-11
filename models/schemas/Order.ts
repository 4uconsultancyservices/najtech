import { Schema } from 'mongoose';
import { getModel } from '../utils';

const OrderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    internshipId: { type: Schema.Types.ObjectId, ref: 'Internship', required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['pending', 'paid', 'cancelled', 'refunded'],
      default: 'pending',
    },
    paymentProvider: { type: String, enum: ['razorpay', 'phonepe', 'upi_qr', 'test'] },
    paymentId: String,
    utrNumber: String,
    senderUpiId: String,
    paymentNotes: String,
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: Date,
    couponId: { type: Schema.Types.ObjectId, ref: 'Coupon' },
    discountAmount: { type: Number, default: 0 },
    finalAmount: { type: Number, required: true },
    invoiceUrl: String,
    metadata: Schema.Types.Mixed,
  },
  { timestamps: true }
);

export const Order = getModel('Order', OrderSchema);
