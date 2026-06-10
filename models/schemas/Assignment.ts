import { Schema } from 'mongoose';
import { getModel } from '../utils';

const FileSchema = new Schema({
  filename: String,
  originalName: String,
  mimeType: String,
  size: Number,
  url: String,
  uploadedAt: { type: Date, default: Date.now },
});

const AssignmentSchema = new Schema(
  {
    enrollmentId: { type: Schema.Types.ObjectId, ref: 'Enrollment', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    internshipId: { type: Schema.Types.ObjectId, ref: 'Internship', required: true },
    weekNumber: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    dueDate: Date,
    submittedAt: Date,
    files: [FileSchema],
    status: {
      type: String,
      enum: ['pending', 'submitted', 'reviewed', 'resubmit'],
      default: 'pending',
    },
    mentorFeedback: String,
    mentorRating: { type: Number, min: 1, max: 5 },
    reviewedAt: Date,
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const Assignment = getModel('Assignment', AssignmentSchema);
