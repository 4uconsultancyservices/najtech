import { Schema } from 'mongoose';
import { getModel } from '../utils';

const CertificateSchema = new Schema(
  {
    certificateNumber: { type: String, required: true, unique: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    internshipId: { type: Schema.Types.ObjectId, ref: 'Internship', required: true },
    enrollmentId: { type: Schema.Types.ObjectId, ref: 'Enrollment', required: true },
    issuedAt: { type: Date, default: Date.now },
    expiresAt: Date,
    templateId: String,
    pdfUrl: String,
    qrCode: String,
    isRevoked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Certificate = getModel('Certificate', CertificateSchema);
