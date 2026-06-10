import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import { CMSPage } from '@/models';
import { auth } from '@/lib/auth/config';
import { successResponse, errorResponse } from '@/lib/api/helpers';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (key) {
      const page = await CMSPage.findOne({ key, isActive: true }).lean();
      if (!page) return errorResponse('Page not found', 404);
      return successResponse(page);
    }

    const pages = await CMSPage.find({ isActive: true }).select('key title').lean();
    return successResponse(pages);
  } catch (error) {
    console.error('[CMS_GET]', error);
    return errorResponse('Failed to fetch CMS data', 500);
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || !['admin', 'super_admin'].includes(session.user.role as string)) {
    return errorResponse('Unauthorized', 401);
  }

  try {
    await connectDB();
    const body = await request.json();
    const { key, title, sections, seo } = body;

    const page = await CMSPage.findOneAndUpdate(
      { key },
      { key, title, sections, seo, isActive: true },
      { upsert: true, new: true, runValidators: true }
    );

    return successResponse(page, 'CMS page saved');
  } catch (error) {
    console.error('[CMS_POST]', error);
    return errorResponse('Failed to save CMS page', 500);
  }
}
