import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import { Category } from '@/models';
import { successResponse, errorResponse } from '@/lib/api/helpers';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const categories = await Category.find({ isActive: true }).sort({ name: 1 }).lean();
    return successResponse(categories);
  } catch (error) {
    console.error('[CATEGORIES_GET]', error);
    return errorResponse('Failed to fetch categories', 500);
  }
}
