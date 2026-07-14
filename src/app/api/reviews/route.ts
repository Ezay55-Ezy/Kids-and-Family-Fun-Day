import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import {
  createReview,
  RatingOutOfRangeError,
  ReviewEligibilityError,
  AlreadyReviewedError,
  EventNotFoundError,
} from '@/services/review-service';
import { Prisma } from '@/generated/prisma/client';
import { createReviewSchema } from '@/validators/review.validator';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rl = await checkRateLimit(`reviews:${session.user.id}`, 5, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 });
  }

  const json = await request.json();
  const parsed = createReviewSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const review = await createReview(
      session.user.id,
      parsed.data.eventId,
      parsed.data.rating,
      parsed.data.comment ?? null,
    );
    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    if (error instanceof RatingOutOfRangeError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof ReviewEligibilityError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof AlreadyReviewedError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    if (error instanceof EventNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'You have already reviewed this event.' },
          { status: 409 },
        );
      }
    }
    console.error('[REVIEW_CREATE_FAILURE]', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 },
    );
  }
}
