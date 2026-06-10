import { Schema } from 'mongoose';
import { getModel } from '../utils';

const MediaSchema = new Schema(
  {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    url: { type: String, required: true },
    width: Number,
    height: Number,
    alt: String,
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const Media = getModel('Media', MediaSchema);
