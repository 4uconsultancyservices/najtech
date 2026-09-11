import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import { Enrollment, Assignment } from '@/models';
import Internship from '@/models/Internship';
import { auth } from '@/lib/auth/config';
import { successResponse, errorResponse } from '@/lib/api/helpers';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return errorResponse('Unauthorized', 401);

  try {
    await connectDB();
    const { id } = await params;

    let enrollment = null;

    // Check if ID is a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(id)) {
      // 1. Try finding by Enrollment ID
      enrollment = await Enrollment.findOne({
        _id: id,
        studentId: session.user.id,
      })
        .populate({
          path: 'internshipId',
          populate: [
            { path: 'mentorId', select: 'title company avatar bio' },
            { path: 'categoryId', select: 'name color' },
          ],
        })
        .populate('certificateId')
        .lean();

      // 2. If not found, try finding by Internship ID
      if (!enrollment) {
        enrollment = await Enrollment.findOne({
          internshipId: id,
          studentId: session.user.id,
        })
          .populate({
            path: 'internshipId',
            populate: [
              { path: 'mentorId', select: 'title company avatar bio' },
              { path: 'categoryId', select: 'name color' },
            ],
          })
          .populate('certificateId')
          .lean();
      }
    }

    if (!enrollment) {
      // If student is admin/super_admin or mentor, allow preview mode fallback for valid internship
      if (['admin', 'super_admin', 'mentor'].includes(session.user.role as string) && mongoose.Types.ObjectId.isValid(id)) {
        const internship = await Internship.findById(id)
          .populate('mentorId', 'title company avatar bio')
          .populate('categoryId', 'name color')
          .lean();

        if (internship) {
          return successResponse({
            enrollment: {
              _id: `preview_${id}`,
              studentId: session.user.id,
              internshipId: internship,
              status: 'active',
              progress: 50,
              completedLessons: [],
              startDate: new Date(),
            },
            assignments: [],
            isPreview: true,
          });
        }
      }
      return errorResponse('Enrollment not found or access denied', 404);
    }

    // Fetch assignments for this enrollment
    const assignments = await Assignment.find({
      studentId: session.user.id,
      $or: [
        { enrollmentId: enrollment._id },
        { internshipId: (enrollment.internshipId as any)._id || enrollment.internshipId },
      ],
    })
      .sort({ weekNumber: 1 })
      .lean();

    return successResponse({
      enrollment,
      assignments,
      isPreview: false,
    });
  } catch (error) {
    console.error('[ENROLLMENT_GET]', error);
    return errorResponse('Failed to fetch enrollment details', 500);
  }
}
