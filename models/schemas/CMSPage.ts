import { Schema } from 'mongoose';
import { getModel } from '../utils';

const CMSSectionSchema = new Schema({
  type: { type: String, required: true },
  title: String,
  data: Schema.Types.Mixed,
  order: { type: Number, default: 0 },
  isEnabled: { type: Boolean, default: true },
});

const CMSPageSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    sections: [CMSSectionSchema],
    seo: Schema.Types.Mixed,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const CMSPage = getModel('CMSPage', CMSPageSchema);
