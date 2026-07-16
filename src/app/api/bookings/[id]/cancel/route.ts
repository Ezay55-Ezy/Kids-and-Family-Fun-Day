import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import {
  cancelBooking,
  BookingNotFoundError,
  NotBookingOwnerError,
  BookingNotCancellableError,
} from '@/services/booking-service';
import { sendBookingCancellationEmail } from '@/services/email-service';
import { createBookingCancellationNotification } from '@/services/notification-service';
import { sendBookingCancellationPush } from '@/services/push-service';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const booking = await cancelBooking(session.user.id, id);

    const fullBooking = await prisma.booking.findUnique({
      where: { id: booking.id },
      include: {
        user: { select: { name: true, email: true } },
        event: { select: { title: true, startDate: true, endDate: true, location: true } },
        items: { include: { ticketType: { select: { name: true, price: true } } } },
      },
    });

    sendBookingCancellationEmail(booking.id, fullBooking ?? undefined).catch((err) =>
      console.error('[EMAIL] Fire-and-forget cancellation failed:', err),
    );
    createBookingCancellationNotification(booking.id, fullBooking ?? undefined).catch((err) =>
      console.error('[NOTIFICATION] Fire-and-forget cancellation failed:', err),
    );
    sendBookingCancellationPush(booking.id, fullBooking ?? undefined).catch((err) =>
      console.error('[PUSH] Fire-and-forget cancellation failed:', err),
    );

    return NextResponse.json({ booking }, { status: 200 });
  } catch (error) {
    if (error instanceof BookingNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof NotBookingOwnerError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof BookingNotCancellableError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    console.error('[BOOKING_CANCEL_FAILURE]', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 },
    );
  }
}
