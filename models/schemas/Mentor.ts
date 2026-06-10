import { Schema } from 'mongoose';
import { getModel } from '../utils';

const MentorSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    title: { type: String, required: true },
    specialization: [String],
    experience: { type: Number, required: true },
    bio: { type: String, required: true },
    avatar: String,
    linkedin: String,
    github: String,
    website: String,
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Mentor = getModel('Mentor', MentorSchema);
