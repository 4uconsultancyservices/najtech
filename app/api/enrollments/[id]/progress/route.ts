import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import { Enrollment, Certificate } from '@/models';
import Internship from '@/models/Internship';
import { auth } from '@/lib/auth/config';
import { successResponse, errorResponse } from '@/lib/api/helpers';
import mongoose from 'mongoose';
import { generateCertificateNumber } from '@/lib/auth/helpers';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return errorResponse('Unauthorized', 401);

  try {
    await connectDB();
    const { id } = await params;
    const { lessonId, completed = true } = await request.json();

    if (!lessonId) return errorResponse('Lesson ID is required', 400);

    let enrollment = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      enrollment = await Enrollment.findOne({
        $or: [{ _id: id }, { internshipId: id }],
        studentId: session.user.id,
      });
    }

    if (!enrollment) return errorResponse('Enrollment not found', 404);

    const internship = await Internship.findById(enrollment.internshipId);
    if (!internship) return errorResponse('Internship not found', 404);

    let completedLessons = enrollment.completedLessons || [];

    if (completed) {
      if (!completedLessons.includes(lessonId)) {
        completedLessons.push(lessonId);
      }
    } else {
      completedLessons = completedLessons.filter((l: string) => l !== lessonId);
    }

    // Calculate total resources count across curriculum
    let totalResources = 0;
    if (Array.isArray(internship.curriculum)) {
      internship.curriculum.forEach((week: any) => {
        if (Array.isArray(week.resources)) {
          totalResources += week.resources.length;
        } else if (Array.isArray(week.topics)) {
          totalResources += week.topics.length;
        } else {
          totalResources += 1;
        }
      });
    }
    if (totalResources === 0) totalResources = (internship.duration || 4) * 3;

    const newProgress = Math.min(100, Math.round((completedLessons.length / totalResources) * 100));

    enrollment.completedLessons = completedLessons;
    enrollment.progress = newProgress;

    // Check completion condition
    let certificate = null;
    if (newProgress >= 100 && enrollment.status !== 'completed') {
      enrollment.status = 'completed';
      enrollment.endDate = new Date();

      // Issue Certificate if not existing
      if (!enrollment.certificateId) {
        certificate = await Certificate.create({
          certificateNumber: generateCertificateNumber(),
          studentId: session.user.id,
          internshipId: internship._id,
          enrollmentId: enrollment._id,
          issueDate: new Date(),
          score: 95,
          skills: internship.skills || [],
          verificationUrl: `/verify-certificate`,
        });
        enrollment.certificateId = certificate._id;
      }
    }

    await enrollment.save();

    return successResponse({
      progress: enrollment.progress,
      completedLessons: enrollment.completedLessons,
      status: enrollment.status,
      certificateId: enrollment.certificateId,
    }, 'Progress updated successfully');
  } catch (error) {
    console.error('[ENROLLMENT_PROGRESS]', error);
    return errorResponse('Failed to update progress', 500);
  }
}
