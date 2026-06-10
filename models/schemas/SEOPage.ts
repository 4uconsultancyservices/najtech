import { Schema } from 'mongoose';
import { getModel } from '../utils';

const SEOPageSchema = new Schema(
  {
    path: { type: String, required: true, unique: true },
    title: String,
    description: String,
    keywords: [String],
    ogTitle: String,
    ogDescription: String,
    ogImage: String,
    canonicalUrl: String,
    noIndex: { type: Boolean, default: false },
    structuredData: Schema.Types.Mixed,
  },
  { timestamps: true }
);

export const SEOPage = getModel('SEOPage', SEOPageSchema);
