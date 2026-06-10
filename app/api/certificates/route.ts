import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import { Certificate, Enrollment } from '@/models';
import { auth } from '@/lib/auth/config';
import { successResponse, errorResponse } from '@/lib/api/helpers';
import { generateCertificateNumber } from '@/lib/auth/helpers';
import QRCode from 'qrcode';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return errorResponse('Unauthorized', 401);

  try {
    await connectDB();
    const { enrollmentId } = await request.json();

    const enrollment = await Enrollment.findById(enrollmentId)
      .populate('internshipId')
      .populate('studentId');

    if (!enrollment) return errorResponse('Enrollment not found', 404);
    if (enrollment.studentId._id.toString() !== session.user.id) {
      return errorResponse('Unauthorized', 401);
    }
    if (enrollment.progress < 100) {
      return errorResponse('Complete all lessons to receive certificate', 400);
    }
    if (enrollment.certificateId) {
      const existing = await Certificate.findById(enrollment.certificateId);
      return successResponse(existing, 'Certificate already issued');
    }

    const certificateNumber = generateCertificateNumber();
    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-certificate?cert=${certificateNumber}`;

    // Generate QR code
    const qrCode = await QRCode.toDataURL(verifyUrl);

    const certificate = await Certificate.create({
      certificateNumber,
      studentId: enrollment.studentId._id,
      internshipId: enrollment.internshipId._id,
      enrollmentId: enrollment._id,
      issuedAt: new Date(),
      qrCode,
    });

    await Enrollment.findByIdAndUpdate(enrollmentId, {
      certificateId: certificate._id,
      status: 'completed',
    });

    return successResponse(certificate, 'Certificate issued successfully', 201);
  } catch (error) {
    console.error('[CERTIFICATE_CREATE]', error);
    return errorResponse('Failed to issue certificate', 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const certNumber = searchParams.get('cert');

    if (certNumber) {
      // Public verification
      const certificate = await Certificate.findOne({ certificateNumber: certNumber })
        .populate('studentId', 'name')
        .populate('internshipId', 'title duration')
        .lean();

      if (!certificate) return errorResponse('Certificate not found', 404);
      if ((certificate as unknown as { isRevoked: boolean }).isRevoked) {
        return errorResponse('This certificate has been revoked', 400);
      }

      return successResponse(certificate);
    }

    // Student's certificates
    const session = await auth();
    if (!session?.user) return errorResponse('Unauthorized', 401);

    const certificates = await Certificate.find({ studentId: session.user.id })
      .populate('internshipId', 'title thumbnail')
      .sort({ issuedAt: -1 })
      .lean();

    return successResponse(certificates);
  } catch (error) {
    console.error('[CERTIFICATE_GET]', error);
    return errorResponse('Failed to fetch certificates', 500);
  }
}
