import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import { Theme } from '@/models';
import { auth } from '@/lib/auth/config';
import { successResponse, errorResponse } from '@/lib/api/helpers';
import { themeSchema } from '@/lib/validations';

export async function GET() {
  try {
    await connectDB();
    let theme = await Theme.findOne().lean();
    if (!theme) {
      theme = await Theme.create({
        siteName: 'NajTech',
        primaryColor: '#6366f1',
        secondaryColor: '#8b5cf6',
        accentColor: '#06b6d4',
        fontFamily: 'Plus Jakarta Sans',
      });
    }
    return successResponse(theme);
  } catch (error) {
    console.error('[THEME_GET]', error);
    return errorResponse('Failed to fetch theme', 500);
  }
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user || !['admin', 'super_admin'].includes(session.user.role as string)) {
    return errorResponse('Unauthorized', 401);
  }

  try {
    await connectDB();
    const body = await request.json();
    const parsed = themeSchema.partial().safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message, 422);
    }

    // Handle file uploads for logo/favicon
    const theme = await Theme.findOneAndUpdate({}, parsed.data, {
      upsert: true,
      new: true,
    });

    return successResponse(theme, 'Theme updated');
  } catch (error) {
    console.error('[THEME_PATCH]', error);
    return errorResponse('Failed to update theme', 500);
  }
}
