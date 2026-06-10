import mongoose, { Schema, Model } from 'mongoose';

// ─── Category ────────────────────────────────────────────────────────────────
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

// ─── Mentor ───────────────────────────────────────────────────────────────────
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

// ─── Enrollment ───────────────────────────────────────────────────────────────
const EnrollmentSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    internshipId: { type: Schema.Types.ObjectId, ref: 'Internship', required: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled', 'expired'],
      default: 'active',
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    completedLessons: [String],
    startDate: { type: Date, default: Date.now },
    endDate: Date,
    certificateId: { type: Schema.Types.ObjectId, ref: 'Certificate' },
  },
  { timestamps: true }
);
EnrollmentSchema.index({ studentId: 1, internshipId: 1 }, { unique: true });

// ─── Assignment ────────────────────────────────────────────────────────────────
const FileSchema = new Schema({
  filename: String,
  originalName: String,
  mimeType: String,
  size: Number,
  url: String,
  uploadedAt: { type: Date, default: Date.now },
});

const AssignmentSchema = new Schema(
  {
    enrollmentId: { type: Schema.Types.ObjectId, ref: 'Enrollment', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    internshipId: { type: Schema.Types.ObjectId, ref: 'Internship', required: true },
    weekNumber: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    dueDate: Date,
    submittedAt: Date,
    files: [FileSchema],
    status: {
      type: String,
      enum: ['pending', 'submitted', 'reviewed', 'resubmit'],
      default: 'pending',
    },
    mentorFeedback: String,
    mentorRating: { type: Number, min: 1, max: 5 },
    reviewedAt: Date,
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// ─── Order ────────────────────────────────────────────────────────────────────
const OrderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    internshipId: { type: Schema.Types.ObjectId, ref: 'Internship', required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['pending', 'paid', 'cancelled', 'refunded'],
      default: 'pending',
    },
    paymentProvider: { type: String, enum: ['razorpay', 'phonepe'] },
    paymentId: String,
    couponId: { type: Schema.Types.ObjectId, ref: 'Coupon' },
    discountAmount: { type: Number, default: 0 },
    finalAmount: { type: Number, required: true },
    invoiceUrl: String,
    metadata: Schema.Types.Mixed,
  },
  { timestamps: true }
);

// ─── Payment ──────────────────────────────────────────────────────────────────
const PaymentSchema = new Schema(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    provider: { type: String, enum: ['razorpay', 'phonepe'], required: true },
    providerId: { type: String, required: true },
    providerOrderId: String,
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed', 'refunded'],
      default: 'pending',
    },
    method: String,
    bank: String,
    wallet: String,
    metadata: Schema.Types.Mixed,
    failureReason: String,
    refundId: String,
    refundedAt: Date,
  },
  { timestamps: true }
);

// ─── Coupon ───────────────────────────────────────────────────────────────────
const CouponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    description: String,
    type: { type: String, enum: ['percentage', 'fixed'], required: true },
    value: { type: Number, required: true },
    maxDiscount: Number,
    minOrderAmount: Number,
    usageLimit: Number,
    usageCount: { type: Number, default: 0 },
    validFrom: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    internships: [{ type: Schema.Types.ObjectId, ref: 'Internship' }],
  },
  { timestamps: true }
);

// ─── Certificate ──────────────────────────────────────────────────────────────
const CertificateSchema = new Schema(
  {
    certificateNumber: { type: String, required: true, unique: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    internshipId: { type: Schema.Types.ObjectId, ref: 'Internship', required: true },
    enrollmentId: { type: Schema.Types.ObjectId, ref: 'Enrollment', required: true },
    issuedAt: { type: Date, default: Date.now },
    expiresAt: Date,
    templateId: String,
    pdfUrl: String,
    qrCode: String,
    isRevoked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ─── Blog ─────────────────────────────────────────────────────────────────────
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

// ─── BlogCategory ─────────────────────────────────────────────────────────────
const BlogCategorySchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ─── Testimonial ──────────────────────────────────────────────────────────────
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

// ─── FAQ ──────────────────────────────────────────────────────────────────────
const FAQSchema = new Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    category: String,
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ─── Notification ─────────────────────────────────────────────────────────────
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

// ─── AuditLog ─────────────────────────────────────────────────────────────────
const AuditLogSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    resource: { type: String, required: true },
    resourceId: Schema.Types.ObjectId,
    details: Schema.Types.Mixed,
    ip: String,
    userAgent: String,
  },
  { timestamps: true }
);
AuditLogSchema.index({ createdAt: -1 });

// ─── Settings ─────────────────────────────────────────────────────────────────
const SettingsSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    value: Schema.Types.Mixed,
    group: { type: String, required: true },
  },
  { timestamps: true }
);

// ─── Theme ────────────────────────────────────────────────────────────────────
const ThemeSchema = new Schema(
  {
    siteName: { type: String, default: 'NajTech' },
    logo: String,
    favicon: String,
    primaryColor: { type: String, default: '#6366f1' },
    secondaryColor: { type: String, default: '#8b5cf6' },
    accentColor: { type: String, default: '#06b6d4' },
    fontFamily: { type: String, default: 'Plus Jakarta Sans' },
    fontSize: { type: String, enum: ['sm', 'md', 'lg'], default: 'md' },
    borderRadius: { type: String, enum: ['none', 'sm', 'md', 'lg', 'full'], default: 'md' },
    darkMode: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ─── CMSPage ──────────────────────────────────────────────────────────────────
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

// ─── Media ────────────────────────────────────────────────────────────────────
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

// ─── SEO ──────────────────────────────────────────────────────────────────────
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

// Helper to register model without duplication
function getModel<T>(name: string, schema: Schema): Model<T> {
  return (mongoose.models[name] || mongoose.model<T>(name, schema)) as Model<T>;
}

export const Category = getModel('Category', CategorySchema);
export const Mentor = getModel('Mentor', MentorSchema);
export const Enrollment = getModel('Enrollment', EnrollmentSchema);
export const Assignment = getModel('Assignment', AssignmentSchema);
export const Order = getModel('Order', OrderSchema);
export const Payment = getModel('Payment', PaymentSchema);
export const Coupon = getModel('Coupon', CouponSchema);
export const Certificate = getModel('Certificate', CertificateSchema);
export const Blog = getModel('Blog', BlogSchema);
export const BlogCategory = getModel('BlogCategory', BlogCategorySchema);
export const Testimonial = getModel('Testimonial', TestimonialSchema);
export const FAQ = getModel('FAQ', FAQSchema);
export const Notification = getModel('Notification', NotificationSchema);
export const AuditLog = getModel('AuditLog', AuditLogSchema);
export const Settings = getModel('Settings', SettingsSchema);
export const Theme = getModel('Theme', ThemeSchema);
export const CMSPage = getModel('CMSPage', CMSPageSchema);
export const Media = getModel('Media', MediaSchema);
export const SEOPage = getModel('SEOPage', SEOPageSchema);
