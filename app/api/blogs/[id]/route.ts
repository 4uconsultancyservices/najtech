import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import { Blog } from '@/models';
import { auth } from '@/lib/auth/config';
import { successResponse, errorResponse } from '@/lib/api/helpers';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const blog = await Blog.findOne({
      $or: [
        { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
        { slug: id },
      ],
    })
      .populate('authorId', 'name avatar')
      .populate('categoryId', 'name slug')
      .lean();

    if (!blog) return errorResponse('Blog not found', 404);

    // Increment view count (non-blocking)
    Blog.findByIdAndUpdate((blog as { _id: string })._id, { $inc: { viewCount: 1 } }).exec();

    return successResponse(blog);
  } catch (error) {
    console.error('[BLOG_GET]', error);
    return errorResponse('Failed to fetch blog', 500);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || !['admin', 'super_admin', 'mentor'].includes(session.user.role as string)) {
    return errorResponse('Unauthorized', 401);
  }

  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    if (body.status === 'published' && !body.publishedAt) {
      body.publishedAt = new Date();
    }

    const blog = await Blog.findByIdAndUpdate(id, body, { new: true });
    if (!blog) return errorResponse('Blog not found', 404);
    return successResponse(blog, 'Blog updated');
  } catch (error) {
    console.error('[BLOG_PATCH]', error);
    return errorResponse('Failed to update blog', 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || !['admin', 'super_admin'].includes(session.user.role as string)) {
    return errorResponse('Unauthorized', 401);
  }

  try {
    await connectDB();
    const { id } = await params;
    await Blog.findByIdAndDelete(id);
    return successResponse(null, 'Blog deleted');
  } catch (error) {
    console.error('[BLOG_DELETE]', error);
    return errorResponse('Failed to delete blog', 500);
  }
}
