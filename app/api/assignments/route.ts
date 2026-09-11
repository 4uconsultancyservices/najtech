import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import { Assignment, Enrollment, Notification } from '@/models';
import { auth } from '@/lib/auth/config';
import { successResponse, errorResponse, paginatedResponse, getPaginationParams } from '@/lib/api/helpers';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return errorResponse('Unauthorized', 401);

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const role = session.user.role as string;

    let query: Record<string, unknown> = {};

    if (role === 'student') {
      query.studentId = session.user.id;
    } else if (['mentor', 'admin', 'super_admin'].includes(role)) {
      const status = searchParams.get('status');
      if (status) query.status = status;
      const internshipId = searchParams.get('internshipId');
      if (internshipId) query.internshipId = internshipId;
    }

    const [assignments, total] = await Promise.all([
      Assignment.find(query)
        .populate('studentId', 'name email avatar')
        .populate('internshipId', 'title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Assignment.countDocuments(query),
    ]);

    return paginatedResponse(assignments, page, limit, total);
  } catch (error) {
    console.error('[ASSIGNMENTS_GET]', error);
    return errorResponse('Failed to fetch assignments', 500);
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return errorResponse('Unauthorized', 401);

  try {
    await connectDB();
    const formData = await request.formData();

    const enrollmentId = formData.get('enrollmentId') as string;
    const weekNumber = parseInt(formData.get('weekNumber') as string);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    if (!enrollmentId || !weekNumber || !title || !description) {
      return errorResponse('All fields are required', 400);
    }

    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment) return errorResponse('Enrollment not found', 404);
    if (enrollment.studentId.toString() !== session.user.id) {
      return errorResponse('Unauthorized', 401);
    }

    const files = [];
    const uploadedFiles = formData.getAll('files') as File[];

    for (const file of uploadedFiles) {
      const { uploadFile } = await import('@/lib/storage');
      const result = await uploadFile(file, 'assignments');
      files.push({
        filename: result.filename,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        url: result.url,
        uploadedAt: new Date(),
      });
    }

    const assignment = await Assignment.create({
      enrollmentId,
      studentId: session.user.id,
      internshipId: enrollment.internshipId,
      weekNumber,
      title,
      description,
      files,
      status: 'submitted',
      submittedAt: new Date(),
    });

    // Notify mentors
    await Notification.create({
      userId: session.user.id,
      title: 'Assignment Submitted',
      message: `Assignment for Week ${weekNumber} submitted successfully.`,
      type: 'success',
    });

    return successResponse(assignment, 'Assignment submitted successfully', 201);
  } catch (error) {
    console.error('[ASSIGNMENT_POST]', error);
    return errorResponse('Failed to submit assignment', 500);
  }
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return errorResponse('Unauthorized', 401);

  const role = session.user.role as string;
  if (!['mentor', 'admin', 'super_admin'].includes(role)) {
    return errorResponse('Only mentors and admins can grade assignments', 403);
  }

  try {
    await connectDB();
    const { assignmentId, status, mentorFeedback, mentorRating } = await request.json();

    if (!assignmentId || !status) {
      return errorResponse('Assignment ID and status are required', 400);
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return errorResponse('Assignment not found', 404);

    assignment.status = status;
    if (mentorFeedback !== undefined) assignment.mentorFeedback = mentorFeedback;
    if (mentorRating !== undefined) assignment.mentorRating = mentorRating;
    assignment.reviewedAt = new Date();
    assignment.reviewedBy = session.user.id;

    await assignment.save();

    // Send notification to student
    await Notification.create({
      userId: assignment.studentId,
      title: status === 'reviewed' ? 'Assignment Approved' : 'Assignment Review Update',
      message: `Your assignment "${assignment.title}" has been reviewed by your mentor.`,
      type: status === 'reviewed' ? 'success' : 'warning',
      link: '/assignments',
    });

    return successResponse(assignment, 'Assignment review updated successfully');
  } catch (error) {
    console.error('[ASSIGNMENTS_PATCH]', error);
    return errorResponse('Failed to review assignment', 500);
  }
}
