import { Schema } from 'mongoose';
import { getModel } from '../utils';

const PaymentSchema = new Schema(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    provider: { type: String, enum: ['razorpay', 'phonepe'], required: true },
    providerId: { type: String, required: true },
    providerOrderId: String,
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed', 'refunded'],
      default: 'pending',
    },
    method: String,
    bank: String,
    wallet: String,
    metadata: Schema.Types.Mixed,
    failureReason: String,
    refundId: String,
    refundedAt: Date,
  },
  { timestamps: true }
);

export const Payment = getModel('Payment', PaymentSchema);
