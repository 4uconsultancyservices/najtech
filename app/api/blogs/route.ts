import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import { Blog } from '@/models';
import { auth } from '@/lib/auth/config';
import { successResponse, errorResponse, paginatedResponse, createSlug, getPaginationParams } from '@/lib/api/helpers';
import { blogSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);

    const query: Record<string, unknown> = {};

    const session = await auth();
    const isAdmin = ['admin', 'super_admin'].includes(session?.user?.role as string);

    if (!isAdmin) {
      query.status = 'published';
    } else {
      const status = searchParams.get('status');
      if (status) query.status = status;
    }

    const search = searchParams.get('search');
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .populate('authorId', 'name avatar')
        .populate('categoryId', 'name slug')
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Blog.countDocuments(query),
    ]);

    return paginatedResponse(blogs, page, limit, total);
  } catch (error) {
    console.error('[BLOGS_GET]', error);
    return errorResponse('Failed to fetch blogs', 500);
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || !['admin', 'super_admin', 'mentor'].includes(session.user.role as string)) {
    return errorResponse('Unauthorized', 401);
  }

  try {
    await connectDB();
    const body = await request.json();
    const parsed = blogSchema.safeParse(body);

    if (!parsed.success) return errorResponse(parsed.error.errors[0].message, 422);

    const slug = createSlug(parsed.data.title);
    const existing = await Blog.findOne({ slug });
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    const blog = await Blog.create({
      ...parsed.data,
      slug: finalSlug,
      authorId: session.user.id,
      publishedAt: parsed.data.status === 'published' ? new Date() : undefined,
    });

    return successResponse(blog, 'Blog created', 201);
  } catch (error) {
    console.error('[BLOGS_POST]', error);
    return errorResponse('Failed to create blog', 500);
  }
}
