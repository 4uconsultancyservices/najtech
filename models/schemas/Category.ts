import { Schema } from 'mongoose';
import { getModel } from '../utils';

const CategorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: String,
    icon: String,
    color: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Category = getModel('Category', CategorySchema);
