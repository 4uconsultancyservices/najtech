import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import { Notification } from '@/models';
import { auth } from '@/lib/auth/config';
import { successResponse, errorResponse } from '@/lib/api/helpers';

export async function GET() {
  const session = await auth();
  if (!session?.user) return errorResponse('Unauthorized', 401);

  try {
    await connectDB();
    const notifications = await Notification.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const unreadCount = await Notification.countDocuments({
      userId: session.user.id,
      isRead: false,
    });

    return successResponse({ notifications, unreadCount });
  } catch (error) {
    console.error('[NOTIFICATIONS_GET]', error);
    return errorResponse('Failed to fetch notifications', 500);
  }
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return errorResponse('Unauthorized', 401);

  try {
    await connectDB();
    const { notificationId, markAllRead } = await request.json();

    if (markAllRead) {
      await Notification.updateMany({ userId: session.user.id, isRead: false }, { isRead: true });
      return successResponse(null, 'All notifications marked as read');
    }

    if (notificationId) {
      await Notification.findByIdAndUpdate(notificationId, { isRead: true });
      return successResponse(null, 'Notification marked as read');
    }

    return errorResponse('Invalid request', 400);
  } catch (error) {
    console.error('[NOTIFICATIONS_PATCH]', error);
    return errorResponse('Failed to update notification', 500);
  }
}
