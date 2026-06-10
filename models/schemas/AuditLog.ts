import { Schema } from 'mongoose';
import { getModel } from '../utils';

const AuditLogSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    resource: { type: String, required: true },
    resourceId: Schema.Types.ObjectId,
    details: Schema.Types.Mixed,
    ip: String,
    userAgent: String,
  },
  { timestamps: true }
);
AuditLogSchema.index({ createdAt: -1 });

export const AuditLog = getModel('AuditLog', AuditLogSchema);
