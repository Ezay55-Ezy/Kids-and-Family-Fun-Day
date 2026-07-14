import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadCount,
  NotificationNotFoundError,
  NotNotificationOwnerError,
} from '@/services/notification-service';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get('limit')) || 20, 100);

  const [notifications, unreadCount] = await Promise.all([
    getUserNotifications(session.user.id, limit),
    getUnreadCount(session.user.id),
  ]);

  return NextResponse.json({ notifications, unreadCount });
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const json = await request.json();
  const { notificationId, markAll } = json;

  if (markAll === true) {
    await markAllNotificationsAsRead(session.user.id);
    return NextResponse.json({ success: true });
  }

  if (!notificationId) {
    return NextResponse.json({ error: 'notificationId or markAll required' }, { status: 400 });
  }

  try {
    await markNotificationAsRead(notificationId, session.user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof NotificationNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof NotNotificationOwnerError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('[NOTIFICATIONS] PATCH error:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
