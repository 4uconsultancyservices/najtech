import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import { SEOPage } from '@/models';
import { auth } from '@/lib/auth/config';
import { successResponse, errorResponse } from '@/lib/api/helpers';

export async function GET() {
  try {
    await connectDB();
    const pages = await SEOPage.find().lean();
    return successResponse(pages);
  } catch (error) {
    console.error('[SEO_GET]', error);
    return errorResponse('Failed to fetch SEO pages', 500);
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
    const { path, ...data } = body;

    if (!path) return errorResponse('Path is required', 400);

    const page = await SEOPage.findOneAndUpdate(
      { path },
      { path, ...data },
      { upsert: true, new: true }
    );

    return successResponse(page, 'SEO settings saved');
  } catch (error) {
    console.error('[SEO_POST]', error);
    return errorResponse('Failed to save SEO settings', 500);
  }
}
