import { prisma } from '@/lib/prisma';

export type NotificationType = 'BOOKING_UPDATE' | 'PAYMENT_UPDATE' | 'VENDOR_STATUS' | 'EVENT_ANNOUNCEMENT' | 'SYSTEM';

export interface UserNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export class NotificationNotFoundError extends Error {
  constructor() {
    super('Notification not found.');
    this.name = 'NotificationNotFoundError';
  }
}

export class NotNotificationOwnerError extends Error {
  constructor() {
    super('You can only manage your own notifications.');
    this.name = 'NotNotificationOwnerError';
  }
}

export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
): Promise<void> {
  await prisma.notification.create({
    data: { userId, type, title, message },
  });
}

export async function createBookingConfirmationNotification(bookingId: string): Promise<void> {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        event: { select: { title: true } },
      },
    });
    if (!booking) {
      console.error('[NOTIFICATION] Booking not found for confirmation:', bookingId);
      return;
    }

    await createNotification(
      booking.userId,
      'BOOKING_UPDATE',
      'Booking Confirmed',
      `Your booking for ${booking.event?.title ?? '(Unknown event)'} has been confirmed.`,
    );
  } catch (err) {
    console.error('[NOTIFICATION] Failed to create confirmation notification:', err);
  }
}

export async function createBookingCancellationNotification(bookingId: string): Promise<void> {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        event: { select: { title: true } },
      },
    });
    if (!booking) {
      console.error('[NOTIFICATION] Booking not found for cancellation:', bookingId);
      return;
    }

    await createNotification(
      booking.userId,
      'BOOKING_UPDATE',
      'Booking Cancelled',
      `Your booking for ${booking.event?.title ?? '(Unknown event)'} has been cancelled.`,
    );
  } catch (err) {
    console.error('[NOTIFICATION] Failed to create cancellation notification:', err);
  }
}

export async function getUserNotifications(
  userId: string,
  limit = 20,
): Promise<UserNotification[]> {
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return notifications.map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    message: n.message,
    isRead: n.isRead,
    createdAt: n.createdAt.toISOString(),
  }));
}

export async function markNotificationAsRead(
  notificationId: string,
  userId: string,
): Promise<void> {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
    select: { userId: true },
  });

  if (!notification) throw new NotificationNotFoundError();
  if (notification.userId !== userId) throw new NotNotificationOwnerError();

  await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}

export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: { userId, isRead: false },
  });
}
