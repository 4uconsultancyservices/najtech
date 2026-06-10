import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(60),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number').optional().or(z.literal('')),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Must contain uppercase, lowercase, and number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const otpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Must contain uppercase, lowercase, and number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const internshipSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  shortDescription: z.string().min(20).max(300),
  description: z.string().min(100, 'Description must be at least 100 characters'),
  mentorId: z.string().min(1, 'Mentor is required'),
  categoryId: z.string().min(1, 'Category is required'),
  duration: z.number().min(1).max(52),
  price: z.number().min(0),
  discountPrice: z.number().min(0).optional(),
  currency: z.string().default('INR'),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  isFeatured: z.boolean().default(false),
  certificate: z.boolean().default(true),
  skills: z.array(z.string()),
  requirements: z.array(z.string()),
  outcomes: z.array(z.string()),
  tags: z.array(z.string()),
});

export const assignmentSubmitSchema = z.object({
  enrollmentId: z.string().min(1),
  weekNumber: z.number().min(1),
  title: z.string().min(3).max(200),
  description: z.string().min(20),
});

export const assignmentReviewSchema = z.object({
  assignmentId: z.string().min(1),
  feedback: z.string().min(10, 'Please provide detailed feedback'),
  rating: z.number().min(1).max(5),
  status: z.enum(['reviewed', 'resubmit']),
});

export const couponSchema = z.object({
  code: z.string().min(3).max(20).toUpperCase(),
  description: z.string().optional(),
  type: z.enum(['percentage', 'fixed']),
  value: z.number().min(1),
  maxDiscount: z.number().optional(),
  minOrderAmount: z.number().optional(),
  usageLimit: z.number().optional(),
  validFrom: z.string().datetime(),
  validUntil: z.string().datetime(),
  isActive: z.boolean().default(true),
});

export const blogSchema = z.object({
  title: z.string().min(5).max(200),
  excerpt: z.string().min(20).max(500),
  content: z.string().min(100),
  categoryId: z.string().optional(),
  tags: z.array(z.string()),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  isFeatured: z.boolean().default(false),
});

export const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().min(5).max(200),
  message: z.string().min(20).max(2000),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(2).max(60),
  phone: z.string().optional(),
  bio: z.string().max(500).optional(),
});

export const themeSchema = z.object({
  siteName: z.string().min(1).max(100),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  fontFamily: z.string(),
  fontSize: z.enum(['sm', 'md', 'lg']),
  borderRadius: z.enum(['none', 'sm', 'md', 'lg', 'full']),
  darkMode: z.boolean(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type InternshipInput = z.infer<typeof internshipSchema>;
export type AssignmentSubmitInput = z.infer<typeof assignmentSubmitSchema>;
export type BlogInput = z.infer<typeof blogSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type ThemeInput = z.infer<typeof themeSchema>;
