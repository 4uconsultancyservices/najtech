import { Schema } from 'mongoose';
import { getModel } from '../utils';

const EnrollmentSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    internshipId: { type: Schema.Types.ObjectId, ref: 'Internship', required: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled', 'expired'],
      default: 'active',
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    completedLessons: [String],
    startDate: { type: Date, default: Date.now },
    endDate: Date,
    certificateId: { type: Schema.Types.ObjectId, ref: 'Certificate' },
  },
  { timestamps: true }
);
EnrollmentSchema.index({ studentId: 1, internshipId: 1 }, { unique: true });

export const Enrollment = getModel('Enrollment', EnrollmentSchema);
