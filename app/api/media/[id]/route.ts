import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import { Media } from '@/models';
import { auth } from '@/lib/auth/config';
import { successResponse, errorResponse } from '@/lib/api/helpers';
import { unlink } from 'fs/promises';
import path from 'path';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || !['admin', 'super_admin'].includes(session.user.role as string)) {
    return errorResponse('Unauthorized', 401);
  }

  try {
    await connectDB();
    const { id } = await params;
    const media = await Media.findById(id);
    if (!media) return errorResponse('File not found', 404);

    // Delete from local storage if applicable
    if (media.url.startsWith('/') && process.env.STORAGE_PROVIDER !== 'cloudinary') {
      try {
        const filePath = path.join(process.cwd(), 'public', media.url);
        await unlink(filePath);
      } catch {
        // File might not exist on disk, continue
      }
    }

    await Media.findByIdAndDelete(id);
    return successResponse(null, 'File deleted');
  } catch (error) {
    console.error('[MEDIA_DELETE]', error);
    return errorResponse('Failed to delete file', 500);
  }
}
