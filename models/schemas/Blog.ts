import { Schema } from 'mongoose';
import { getModel } from '../utils';

const BlogSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    excerpt: { type: String, required: true },
    thumbnail: String,
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'BlogCategory' },
    tags: [String],
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    isFeatured: { type: Boolean, default: false },
    viewCount: { type: Number, default: 0 },
    seo: Schema.Types.Mixed,
    publishedAt: Date,
  },
  { timestamps: true }
);
BlogSchema.index({ slug: 1 });
BlogSchema.index({ status: 1, publishedAt: -1 });

export const Blog = getModel('Blog', BlogSchema);
