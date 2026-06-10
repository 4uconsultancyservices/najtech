import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import Internship from '@/models/Internship';
import { auth } from '@/lib/auth/config';
import { successResponse, errorResponse, paginatedResponse, createSlug, getPaginationParams } from '@/lib/api/helpers';
import { internshipSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);

    const query: Record<string, unknown> = {};

    const status = searchParams.get('status');
    if (status) query.status = status;
    else query.status = 'published'; // Default: only published

    const category = searchParams.get('category');
    if (category) query.categoryId = category;

    const featured = searchParams.get('featured');
    if (featured === 'true') query.isFeatured = true;

    const search = searchParams.get('search');
    if (search) query.$text = { $search: search };

    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) (query.price as Record<string, number>).$gte = Number(minPrice);
      if (maxPrice) (query.price as Record<string, number>).$lte = Number(maxPrice);
    }

    const sortField = searchParams.get('sort') || 'createdAt';
    const sortOrder = searchParams.get('order') === 'asc' ? 1 : -1;

    const [internships, total] = await Promise.all([
      Internship.find(query)
        .populate('mentorId', 'title avatar')
        .populate('categoryId', 'name slug color')
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      Internship.countDocuments(query),
    ]);

    return paginatedResponse(internships, page, limit, total);
  } catch (error) {
    console.error('[INTERNSHIPS_GET]', error);
    return errorResponse('Failed to fetch internships', 500);
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
    const parsed = internshipSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message, 422);
    }

    const slug = createSlug(parsed.data.title);
    const existing = await Internship.findOne({ slug });
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    const internship = await Internship.create({
      ...parsed.data,
      slug: finalSlug,
    });

    return successResponse(internship, 'Internship created successfully', 201);
  } catch (error) {
    console.error('[INTERNSHIPS_POST]', error);
    return errorResponse('Failed to create internship', 500);
  }
}
