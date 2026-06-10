import { Schema } from 'mongoose';
import { getModel } from '../utils';

const TestimonialSchema = new Schema(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
    company: String,
    avatar: String,
    content: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Testimonial = getModel('Testimonial', TestimonialSchema);
