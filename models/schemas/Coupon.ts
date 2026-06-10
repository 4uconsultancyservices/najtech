import { Schema } from 'mongoose';
import { getModel } from '../utils';

const CouponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    description: String,
    type: { type: String, enum: ['percentage', 'fixed'], required: true },
    value: { type: Number, required: true },
    maxDiscount: Number,
    minOrderAmount: Number,
    usageLimit: Number,
    usageCount: { type: Number, default: 0 },
    validFrom: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    internships: [{ type: Schema.Types.ObjectId, ref: 'Internship' }],
  },
  { timestamps: true }
);

export const Coupon = getModel('Coupon', CouponSchema);
