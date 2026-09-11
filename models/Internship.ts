import mongoose, { Schema, Document, Model } from 'mongoose';

const ResourceSchema = new Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['video', 'pdf', 'link', 'assignment'], required: true },
  url: { type: String, required: true },
  duration: { type: Number },
  isPreview: { type: Boolean, default: false },
});

const CurriculumSchema = new Schema({
  week: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  topics: [{ type: String }],
  resources: [ResourceSchema],
});

const FAQSchema = new Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  order: { type: Number, default: 0 },
});

const SEOSchema = new Schema({
  title: String,
  description: String,
  keywords: [String],
  ogTitle: String,
  ogDescription: String,
  ogImage: String,
  canonicalUrl: String,
  noIndex: { type: Boolean, default: false },
});

export interface IInternshipDocument extends Document {
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  thumbnail?: string;
  banner?: string;
  mentorId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  duration: number;
  price: number;
  discountPrice?: number;
  currency: string;
  curriculum: unknown[];
  skills: string[];
  requirements: string[];
  outcomes: string[];
  faqs: unknown[];
  status: 'draft' | 'published' | 'archived';
  isFeatured: boolean;
  enrollmentCount: number;
  rating: number;
  reviewCount: number;
  certificate: boolean;
  tags: string[];
  seo?: unknown;
  createdAt: Date;
  updatedAt: Date;
}

const InternshipSchema = new Schema<IInternshipDocument>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    shortDescription: { type: String, required: true, maxlength: 300 },
    thumbnail: { type: String },
    banner: { type: String },
    mentorId: { type: Schema.Types.ObjectId, ref: 'Mentor', required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    duration: { type: Number, required: true },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    currency: { type: String, default: 'INR' },
    curriculum: [CurriculumSchema],
    skills: [{ type: String }],
    requirements: [{ type: String }],
    outcomes: [{ type: String }],
    faqs: [FAQSchema],
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    isFeatured: { type: Boolean, default: false },
    enrollmentCount: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    certificate: { type: Boolean, default: true },
    tags: [{ type: String }],
    seo: SEOSchema,
  },
  { timestamps: true }
);

InternshipSchema.index({ status: 1 });
InternshipSchema.index({ categoryId: 1 });
InternshipSchema.index({ isFeatured: 1 });
InternshipSchema.index({ title: 'text', description: 'text', tags: 'text' });

const Internship: Model<IInternshipDocument> =
  mongoose.models.Internship ||
  mongoose.model<IInternshipDocument>('Internship', InternshipSchema);

export default Internship;
