import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import Internship from '@/models/Internship';
import { auth } from '@/lib/auth/config';
import { successResponse, errorResponse, createSlug } from '@/lib/api/helpers';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;

    const internship = await Internship.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { slug: id }],
    })
      .populate('mentorId')
      .populate('categoryId')
      .lean();

    if (!internship) return errorResponse('Internship not found', 404);

    return successResponse(internship);
  } catch (error) {
    console.error('[INTERNSHIP_GET]', error);
    return errorResponse('Failed to fetch internship', 500);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || !['admin', 'super_admin'].includes(session.user.role as string)) {
    return errorResponse('Unauthorized', 401);
  }

  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    if (body.title) {
      body.slug = createSlug(body.title);
    }

    const internship = await Internship.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!internship) return errorResponse('Internship not found', 404);

    return successResponse(internship, 'Internship updated');
  } catch (error) {
    console.error('[INTERNSHIP_PATCH]', error);
    return errorResponse('Failed to update internship', 500);
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
    const internship = await Internship.findByIdAndDelete(id);
    if (!internship) return errorResponse('Internship not found', 404);

    return successResponse(null, 'Internship deleted');
  } catch (error) {
    console.error('[INTERNSHIP_DELETE]', error);
    return errorResponse('Failed to delete internship', 500);
  }
}
