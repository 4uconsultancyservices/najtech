import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import { Media } from '@/models';
import { auth } from '@/lib/auth/config';
import { successResponse, errorResponse, getPaginationParams, paginatedResponse } from '@/lib/api/helpers';
import { uploadFile, ALLOWED_IMAGE_TYPES, ALLOWED_DOCUMENT_TYPES, MAX_FILE_SIZE } from '@/lib/storage';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user || !['admin', 'super_admin'].includes(session.user.role as string)) {
    return errorResponse('Unauthorized', 401);
  }

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);

    const [files, total] = await Promise.all([
      Media.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Media.countDocuments(),
    ]);

    return paginatedResponse(files, page, limit, total);
  } catch (error) {
    console.error('[MEDIA_GET]', error);
    return errorResponse('Failed to fetch media', 500);
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || !['admin', 'super_admin'].includes(session.user.role as string)) {
    return errorResponse('Unauthorized', 401);
  }

  try {
    await connectDB();
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) return errorResponse('No file provided', 400);

    const allowedTypes = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES];
    if (!allowedTypes.some((t) => file.type === t || file.name.toLowerCase().endsWith(t.split('/')[1]))) {
      return errorResponse('File type not allowed', 400);
    }

    const maxSize = ALLOWED_IMAGE_TYPES.includes(file.type) ? MAX_FILE_SIZE.image : MAX_FILE_SIZE.document;
    if (file.size > maxSize) {
      return errorResponse(`File too large. Max size: ${Math.round(maxSize / (1024 * 1024))}MB`, 400);
    }

    const result = await uploadFile(file, 'media');

    const media = await Media.create({
      filename: result.filename,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      url: result.url,
      uploadedBy: session.user.id,
    });

    return successResponse(media, 'File uploaded', 201);
  } catch (error) {
    console.error('[MEDIA_POST]', error);
    return errorResponse('Failed to upload file', 500);
  }
}
