import { Schema } from 'mongoose';
import { getModel } from '../utils';

const BlogCategorySchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const BlogCategory = getModel('BlogCategory', BlogCategorySchema);
