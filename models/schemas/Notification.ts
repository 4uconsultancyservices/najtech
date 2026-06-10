import { Schema } from 'mongoose';
import { getModel } from '../utils';

const NotificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['info', 'success', 'warning', 'error'], default: 'info' },
    isRead: { type: Boolean, default: false },
    link: String,
  },
  { timestamps: true }
);
NotificationSchema.index({ userId: 1, isRead: 1 });

export const Notification = getModel('Notification', NotificationSchema);
