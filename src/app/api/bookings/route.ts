import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { bookingSchema } from '@/validators/booking.validator';
import {
  createBooking,
  InsufficientAvailabilityError,
  BookingEventNotFoundError,
} from '@/services/booking-service';
import { sendBookingConfirmationEmail } from '@/services/email-service';
import { createBookingConfirmationNotification } from '@/services/notification-service';
import { sendBookingConfirmationPush } from '@/services/push-service';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const json = await request.json();
  const parsed = bookingSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const booking = await createBooking({
      userId: session.user.id,
      eventId: parsed.data.eventId,
      items: parsed.data.items,
    });

    sendBookingConfirmationEmail(booking.id).catch((err) =>
      console.error('[EMAIL] Fire-and-forget confirmation failed:', err),
    );
    createBookingConfirmationNotification(booking.id).catch((err) =>
      console.error('[NOTIFICATION] Fire-and-forget confirmation failed:', err),
    );
    sendBookingConfirmationPush(booking.id).catch((err) =>
      console.error('[PUSH] Fire-and-forget confirmation failed:', err),
    );

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    if (error instanceof InsufficientAvailabilityError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    if (error instanceof BookingEventNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    console.error('[BOOKING_CREATE_FAILURE]', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 },
    );
  }
}
