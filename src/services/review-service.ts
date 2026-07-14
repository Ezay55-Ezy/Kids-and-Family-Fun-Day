import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/prisma/client';

export interface ReviewWithUser {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { name: string | null };
}

export interface EventReviews {
  reviews: ReviewWithUser[];
  averageRating: number;
  totalReviews: number;
}

export class ReviewEligibilityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ReviewEligibilityError';
  }
}

export class RatingOutOfRangeError extends Error {
  constructor() {
    super('Rating must be between 1 and 5.');
    this.name = 'RatingOutOfRangeError';
  }
}

export class AlreadyReviewedError extends Error {
  constructor() {
    super('You have already reviewed this event.');
    this.name = 'AlreadyReviewedError';
  }
}

export class EventNotFoundError extends Error {
  constructor() {
    super('Event not found.');
    this.name = 'EventNotFoundError';
  }
}

export async function getEventReviews(eventId: string): Promise<EventReviews> {
  const reviews = await prisma.review.findMany({
    where: { eventId },
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      user: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

  return {
    reviews: reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt.toISOString(),
      user: { name: r.user.name },
    })),
    averageRating: Math.round(averageRating * 10) / 10,
    totalReviews,
  };
}

export async function canReviewEvent(
  userId: string,
  eventId: string,
): Promise<boolean> {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { endDate: true },
  });

  if (!event) return false;
  if (event.endDate > new Date()) return false;

  const hasBooking = await prisma.booking.findFirst({
    where: {
      userId,
      eventId,
      status: 'CONFIRMED',
    },
  });

  if (!hasBooking) return false;

  const existingReview = await prisma.review.findUnique({
    where: { userId_eventId: { userId, eventId } },
  });

  if (existingReview) return false;

  return true;
}

export async function createReview(
  userId: string,
  eventId: string,
  rating: number,
  comment: string | null,
): Promise<ReviewWithUser> {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new RatingOutOfRangeError();
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { endDate: true },
  });

  if (!event) throw new EventNotFoundError();
  if (event.endDate > new Date()) {
    throw new ReviewEligibilityError(
      'You can only review events that have already taken place.',
    );
  }

  const hasBooking = await prisma.booking.findFirst({
    where: {
      userId,
      eventId,
      status: 'CONFIRMED',
    },
  });

  if (!hasBooking) {
    throw new ReviewEligibilityError(
      'You must have a confirmed booking for this event to leave a review.',
    );
  }

  const review = await prisma.review.create({
    data: {
      userId,
      eventId,
      rating,
      comment: comment?.trim() || null,
    },
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      user: { select: { name: true } },
    },
  });

  return {
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt.toISOString(),
    user: { name: review.user.name },
  };
}
