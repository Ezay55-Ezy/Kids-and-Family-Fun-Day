import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

export enum ScanResult {
  VALID = 'VALID',
  ALREADY_CHECKED_IN = 'ALREADY_CHECKED_IN',
  CANCELLED = 'CANCELLED',
  NOT_FOUND = 'NOT_FOUND',
}

export interface ScanOutcome {
  result: ScanResult;
  booking?: {
    id: string;
    ticketCode: string;
    eventTitle: string;
    attendeeName: string;
    checkedInAt: string | null;
  };
}

function generateTicketCode(): string {
  return 'TKT-' + crypto.randomBytes(16).toString('hex').toUpperCase();
}

export class InsufficientAvailabilityError extends Error {
  constructor(public itemName: string) {
    super(`"${itemName}" no longer has enough tickets available.`);
    this.name = 'InsufficientAvailabilityError';
  }
}

export class BookingEventNotFoundError extends Error {
  constructor() {
    super('Event not found.');
    this.name = 'BookingEventNotFoundError';
  }
}

export class BookingNotFoundError extends Error {
  constructor() {
    super('Booking not found.');
    this.name = 'BookingNotFoundError';
  }
}

export class NotBookingOwnerError extends Error {
  constructor() {
    super('You can only manage your own bookings.');
    this.name = 'NotBookingOwnerError';
  }
}

export class BookingNotCancellableError extends Error {
  constructor(reason: string) {
    super(reason);
    this.name = 'BookingNotCancellableError';
  }
}

export interface CreateBookingInput {
  userId: string;
  eventId: string;
  items: Array<{
    ticketTypeId: string;
    quantity: number;
  }>;
}

export async function createBooking(input: CreateBookingInput) {
  const event = await prisma.event.findUnique({ where: { id: input.eventId } });
  if (!event) throw new BookingEventNotFoundError();

  return prisma.$transaction(async (tx) => {
    const ticketTypes = await tx.ticketType.findMany({
      where: {
        id: { in: input.items.map((i) => i.ticketTypeId) },
        eventId: input.eventId,
      },
    });

    const ticketTypeMap = new Map(ticketTypes.map((tt) => [tt.id, tt]));

    interface BookingItemPrep {
      ticketTypeId: string;
      quantity: number;
      unitPrice: number;
      subtotal: number;
      ticketTypeName: string;
    }

    const bookingItems: BookingItemPrep[] = [];

    for (const item of input.items) {
      const tt = ticketTypeMap.get(item.ticketTypeId);
      if (!tt) {
        throw new InsufficientAvailabilityError('Unknown ticket type');
      }

      const unitPrice = Number(tt.price.toString());
      const subtotal = unitPrice * item.quantity;

      bookingItems.push({
        ticketTypeId: tt.id,
        quantity: item.quantity,
        unitPrice,
        subtotal,
        ticketTypeName: tt.name,
      });
    }

    for (const bi of bookingItems) {
      const tt = ticketTypeMap.get(bi.ticketTypeId)!;

      const result = await tx.ticketType.updateMany({
        where: {
          id: bi.ticketTypeId,
          ticketsSold: { lte: tt.capacity - bi.quantity },
        },
        data: { ticketsSold: { increment: bi.quantity } },
      });

      if (result.count === 0) {
        throw new InsufficientAvailabilityError(bi.ticketTypeName);
      }
    }

    const totalAmount = bookingItems.reduce((sum, bi) => sum + bi.subtotal, 0);

    const booking = await tx.booking.create({
      data: {
        userId: input.userId,
        eventId: input.eventId,
        status: 'CONFIRMED',
        totalAmount,
        ticketCode: generateTicketCode(),
        items: {
          create: bookingItems.map((bi) => ({
            ticketTypeId: bi.ticketTypeId,
            quantity: bi.quantity,
            unitPrice: bi.unitPrice,
            subtotal: bi.subtotal,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return booking;
  });
}

export async function cancelBooking(userId: string, bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      event: { select: { startDate: true } },
      items: { include: { ticketType: { select: { id: true } } } },
    },
  });

  if (!booking) throw new BookingNotFoundError();
  if (booking.userId !== userId) throw new NotBookingOwnerError();
  if (booking.status !== 'CONFIRMED') {
    throw new BookingNotCancellableError(
      `Booking cannot be cancelled because its status is "${booking.status.toLowerCase()}".`,
    );
  }
  if (booking.event && booking.event.startDate <= new Date()) {
    throw new BookingNotCancellableError(
      'This event has already started or ended. Cancellation is no longer available.',
    );
  }

  return prisma.$transaction(async (tx) => {
    const bookingRef = await tx.booking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED' },
    });

    for (const item of booking.items) {
      const result = await tx.ticketType.updateMany({
        where: {
          id: item.ticketType.id,
          ticketsSold: { gte: item.quantity },
        },
        data: { ticketsSold: { decrement: item.quantity } },
      });

      if (result.count === 0) {
        console.warn(
          `[CANCEL_SAFETY] ticketType ${item.ticketType.id} ticketsSold would go negative; forcing to 0`,
        );
        await tx.ticketType.update({
          where: { id: item.ticketType.id },
          data: { ticketsSold: 0 },
        });
      }
    }

    return bookingRef;
  });
}

export async function validateTicketCode(ticketCode: string): Promise<ScanOutcome> {
  const booking = await prisma.booking.findUnique({
    where: { ticketCode },
    include: {
      user: { select: { name: true } },
      event: { select: { title: true } },
    },
  });

  if (!booking) {
    return { result: ScanResult.NOT_FOUND };
  }

  if (booking.status === 'CANCELLED') {
    return {
      result: ScanResult.CANCELLED,
      booking: {
        id: booking.id,
        ticketCode: booking.ticketCode,
        eventTitle: booking.event?.title ?? '(Unknown event)',
        attendeeName: booking.user.name ?? 'Unknown',
        checkedInAt: null,
      },
    };
  }

  if (booking.checkedInAt) {
    return {
      result: ScanResult.ALREADY_CHECKED_IN,
      booking: {
        id: booking.id,
        ticketCode: booking.ticketCode,
        eventTitle: booking.event?.title ?? '(Unknown event)',
        attendeeName: booking.user.name ?? 'Unknown',
        checkedInAt: booking.checkedInAt.toISOString(),
      },
    };
  }

  const now = new Date();

  const result = await prisma.booking.updateMany({
    where: {
      ticketCode,
      checkedInAt: null,
      status: 'CONFIRMED',
    },
    data: { checkedInAt: now },
  });

  if (result.count === 0) {
    // Race condition: another scanner checked it in between our read and write
    const alreadyChecked = await prisma.booking.findUnique({
      where: { ticketCode },
      select: { checkedInAt: true, user: { select: { name: true } }, event: { select: { title: true } } },
    });

    if (alreadyChecked?.checkedInAt) {
      return {
        result: ScanResult.ALREADY_CHECKED_IN,
        booking: {
          id: booking.id,
          ticketCode: booking.ticketCode,
          eventTitle: alreadyChecked.event?.title ?? '(Unknown event)',
          attendeeName: alreadyChecked.user.name ?? 'Unknown',
          checkedInAt: alreadyChecked.checkedInAt.toISOString(),
        },
      };
    }

    return { result: ScanResult.NOT_FOUND };
  }

  return {
    result: ScanResult.VALID,
    booking: {
      id: booking.id,
      ticketCode: booking.ticketCode,
      eventTitle: booking.event?.title ?? '(Unknown event)',
      attendeeName: booking.user.name ?? 'Unknown',
      checkedInAt: now.toISOString(),
    },
  };
}
