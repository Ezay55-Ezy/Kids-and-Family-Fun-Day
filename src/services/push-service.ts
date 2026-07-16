import { prisma } from '@/lib/prisma';
import webpush from 'web-push';

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY ?? '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY ?? '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT ?? 'mailto:admin@kidsfamilyfunday.co.ke';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

export interface PushSubscriptionInput {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export async function subscribeUser(
  userId: string,
  subscription: PushSubscriptionInput,
): Promise<void> {
  await prisma.pushSubscription.upsert({
    where: {
      userId_endpoint: { userId, endpoint: subscription.endpoint },
    },
    update: {
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
    create: {
      userId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
  });
}

export async function unsubscribeUser(userId: string, endpoint: string): Promise<void> {
  await prisma.pushSubscription.deleteMany({
    where: { userId, endpoint },
  });
}

export async function unsubscribeAll(userId: string): Promise<void> {
  await prisma.pushSubscription.deleteMany({
    where: { userId },
  });
}

export async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  url?: string,
): Promise<void> {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.warn('[PUSH] VAPID keys not configured — skipping push notification');
    return;
  }

  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
  });

  if (subscriptions.length === 0) return;

  const payload = JSON.stringify({ title, body, url: url ?? '/dashboard/notifications' });

  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        payload,
      ),
    ),
  );

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (result.status === 'rejected') {
      const err = result.reason;
      if (err?.statusCode === 410 || err?.statusCode === 404) {
        await prisma.pushSubscription.delete({
          where: { id: subscriptions[i].id },
        }).catch(() => {});
      } else {
        console.error('[PUSH] Failed to send to', subscriptions[i].endpoint, err);
      }
    }
  }
}

export async function sendBookingConfirmationPush(bookingId: string, preFetched?: { userId: string; event: { title: string } | null } | null): Promise<void> {
  try {
    const booking = preFetched ?? await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { event: { select: { title: true } } },
    });
    if (!booking) return;

    const eventTitle = booking.event?.title ?? '(Unknown event)';
    await sendPushNotification(
      booking.userId,
      'Booking Confirmed',
      `Your booking for ${eventTitle} has been confirmed.`,
      '/dashboard/tickets',
    );
  } catch (err) {
    console.error('[PUSH] Failed to send confirmation push:', err);
  }
}

export async function sendBookingCancellationPush(bookingId: string, preFetched?: { userId: string; event: { title: string } | null } | null): Promise<void> {
  try {
    const booking = preFetched ?? await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { event: { select: { title: true } } },
    });
    if (!booking) return;

    const eventTitle = booking.event?.title ?? '(Unknown event)';
    await sendPushNotification(
      booking.userId,
      'Booking Cancelled',
      `Your booking for ${eventTitle} has been cancelled.`,
      '/dashboard/bookings',
    );
  } catch (err) {
    console.error('[PUSH] Failed to send cancellation push:', err);
  }
}

export { VAPID_PUBLIC_KEY };
