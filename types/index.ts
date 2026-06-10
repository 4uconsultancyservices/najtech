export type UserRole = 'student' | 'mentor' | 'admin' | 'super_admin';
export type InternshipStatus = 'draft' | 'published' | 'archived';
export type EnrollmentStatus = 'active' | 'completed' | 'cancelled' | 'expired';
export type AssignmentStatus = 'pending' | 'submitted' | 'reviewed' | 'resubmit';
export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded';
export type OrderStatus = 'pending' | 'paid' | 'cancelled' | 'refunded';
export type PaymentProvider = 'razorpay' | 'phonepe';
export type StorageProvider = 'local' | 'cloudinary';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  password?: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  otp?: string;
  otpExpiry?: Date;
  resetToken?: string;
  resetTokenExpiry?: Date;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMentor {
  _id: string;
  userId: string;
  user?: IUser;
  title: string;
  specialization: string[];
  experience: number;
  bio: string;
  avatar?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICurriculum {
  _id?: string;
  week: number;
  title: string;
  description: string;
  topics: string[];
  resources?: IResource[];
}

export interface IResource {
  _id?: string;
  title: string;
  type: 'video' | 'pdf' | 'link' | 'assignment';
  url: string;
  duration?: number;
  isPreview?: boolean;
}

export interface IInternship {
  _id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  thumbnail?: string;
  banner?: string;
  mentorId: string;
  mentor?: IMentor;
  categoryId: string;
  category?: ICategory;
  duration: number;
  price: number;
  discountPrice?: number;
  currency: string;
  curriculum: ICurriculum[];
  skills: string[];
  requirements: string[];
  outcomes: string[];
  faqs: IFAQ[];
  status: InternshipStatus;
  isFeatured: boolean;
  enrollmentCount: number;
  rating: number;
  reviewCount: number;
  certificate: boolean;
  tags: string[];
  seo?: ISEOMeta;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface IEnrollment {
  _id: string;
  studentId: string;
  student?: IUser;
  internshipId: string;
  internship?: IInternship;
  orderId: string;
  status: EnrollmentStatus;
  progress: number;
  completedLessons: string[];
  startDate: Date;
  endDate?: Date;
  certificateId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAssignment {
  _id: string;
  enrollmentId: string;
  enrollment?: IEnrollment;
  studentId: string;
  student?: IUser;
  internshipId: string;
  internship?: IInternship;
  weekNumber: number;
  title: string;
  description: string;
  dueDate?: Date;
  submittedAt?: Date;
  files: IFile[];
  status: AssignmentStatus;
  mentorFeedback?: string;
  mentorRating?: number;
  reviewedAt?: Date;
  reviewedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFile {
  _id?: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: Date;
}

export interface IOrder {
  _id: string;
  orderNumber: string;
  studentId: string;
  student?: IUser;
  internshipId: string;
  internship?: IInternship;
  amount: number;
  currency: string;
  status: OrderStatus;
  paymentProvider?: PaymentProvider;
  paymentId?: string;
  couponId?: string;
  coupon?: ICoupon;
  discountAmount: number;
  finalAmount: number;
  invoiceUrl?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPayment {
  _id: string;
  orderId: string;
  order?: IOrder;
  studentId: string;
  provider: PaymentProvider;
  providerId: string;
  providerOrderId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method?: string;
  bank?: string;
  wallet?: string;
  metadata?: Record<string, unknown>;
  failureReason?: string;
  refundId?: string;
  refundedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICoupon {
  _id: string;
  code: string;
  description?: string;
  type: 'percentage' | 'fixed';
  value: number;
  maxDiscount?: number;
  minOrderAmount?: number;
  usageLimit?: number;
  usageCount: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  internships?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ICertificate {
  _id: string;
  certificateNumber: string;
  studentId: string;
  student?: IUser;
  internshipId: string;
  internship?: IInternship;
  enrollmentId: string;
  issuedAt: Date;
  expiresAt?: Date;
  templateId?: string;
  pdfUrl?: string;
  qrCode?: string;
  isRevoked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBlog {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  thumbnail?: string;
  authorId: string;
  author?: IUser;
  categoryId?: string;
  category?: IBlogCategory;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  isFeatured: boolean;
  viewCount: number;
  seo?: ISEOMeta;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBlogCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
}

export interface ITestimonial {
  _id: string;
  name: string;
  role: string;
  company?: string;
  avatar?: string;
  content: string;
  rating: number;
  isActive: boolean;
  isFeatured: boolean;
  order: number;
  createdAt: Date;
}

export interface IFAQ {
  _id?: string;
  question: string;
  answer: string;
  order?: number;
  isActive?: boolean;
}

export interface INotification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  link?: string;
  createdAt: Date;
}

export interface IAuditLog {
  _id: string;
  userId: string;
  user?: IUser;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface ISEOMeta {
  title?: string;
  description?: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
}

export interface ISettings {
  _id: string;
  key: string;
  value: unknown;
  group: string;
  updatedAt: Date;
}

export interface ITheme {
  _id: string;
  siteName: string;
  logo?: string;
  favicon?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  fontSize: 'sm' | 'md' | 'lg';
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  darkMode: boolean;
  updatedAt: Date;
}

export interface ICMSPage {
  _id: string;
  key: string;
  title: string;
  sections: ICMSSection[];
  seo?: ISEOMeta;
  isActive: boolean;
  updatedAt: Date;
}

export interface ICMSSection {
  _id?: string;
  type: string;
  title?: string;
  data: Record<string, unknown>;
  order: number;
  isEnabled: boolean;
}

export interface IMedia {
  _id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  width?: number;
  height?: number;
  alt?: string;
  uploadedBy: string;
  createdAt: Date;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}
