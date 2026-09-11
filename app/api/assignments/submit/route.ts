import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import { Assignment, Notification } from '@/models';
import { auth } from '@/lib/auth/config';
import { successResponse, errorResponse } from '@/lib/api/helpers';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return errorResponse('Unauthorized', 401);

  try {
    await connectDB();
    const {
      enrollmentId,
      internshipId,
      weekNumber = 1,
      title,
      description,
      githubUrl,
      demoUrl,
      notes,
    } = await request.json();

    if (!internshipId || !title) {
      return errorResponse('Internship ID and assignment title are required', 400);
    }

    const files = [];
    if (githubUrl?.trim()) {
      files.push({
        filename: 'GitHub Repository',
        originalName: githubUrl.trim(),
        mimeType: 'text/html',
        size: 0,
        url: githubUrl.trim(),
      });
    }
    if (demoUrl?.trim()) {
      files.push({
        filename: 'Live Demo URL',
        originalName: demoUrl.trim(),
        mimeType: 'text/html',
        size: 0,
        url: demoUrl.trim(),
      });
    }

    // Upsert assignment submission
    const assignment = await Assignment.findOneAndUpdate(
      {
        studentId: session.user.id,
        internshipId,
        weekNumber,
      },
      {
        enrollmentId,
        studentId: session.user.id,
        internshipId,
        weekNumber,
        title: title || `Week ${weekNumber} Assignment`,
        description: description || notes || 'Student project deliverable submission',
        submittedAt: new Date(),
        files,
        status: 'submitted',
        mentorFeedback: undefined,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Create notification
    await Notification.create({
      userId: session.user.id,
      title: 'Assignment Submitted!',
      message: `Your Week ${weekNumber} assignment "${assignment.title}" has been submitted for mentor review.`,
      type: 'info',
      link: `/my-internships/${internshipId}`,
    });

    return successResponse(assignment, 'Assignment submitted successfully for mentor review');
  } catch (error) {
    console.error('[ASSIGNMENT_SUBMIT]', error);
    return errorResponse('Failed to submit assignment', 500);
  }
}
