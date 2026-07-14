import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { requireAdmin } from '@/lib/auth-utils';
import { eventUpdateSchema, buildEventDates } from '@/validators/event.validator';
import {
  getEvent,
  updateEvent,
  deleteEvent,
  EventNotFoundError,
  SlugAlreadyTakenError,
} from '@/services/event-service';

async function authorize() {
  const session = await auth();
  if (!session?.user?.id) return null;
  try { await requireAdmin(session.user.id); return session; } catch { return null; }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await authorize();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const event = await getEvent(id);
    return NextResponse.json({ event });
  } catch (error) {
    if (error instanceof EventNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    throw error;
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await authorize();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const json = await request.json();
  const parsed = eventUpdateSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const input: Record<string, unknown> = {};

  if (data.title !== undefined) input.title = data.title;
  if (data.slug !== undefined) input.slug = data.slug;
  if (data.shortDescription !== undefined) input.shortDescription = data.shortDescription;
  if (data.description !== undefined) input.description = data.description;
  if (data.location !== undefined) input.location = data.location;
  if (data.bannerImageUrl !== undefined) input.bannerImageUrl = data.bannerImageUrl;
  if (data.capacity !== undefined) input.capacity = data.capacity;
  if (data.status !== undefined) input.status = data.status;

  if (data.startDate || data.startTime || data.endDate || data.endTime) {
    const currentStart = data.startDate
      ? `${data.startDate}T${data.startTime || '00:00'}:00`
      : undefined;
    const currentEnd = data.endDate
      ? `${data.endDate}T${data.endTime || '23:59'}:00`
      : undefined;

    if (data.startDate) {
      input.startDate = new Date(currentStart!);
    }
    if (data.endDate) {
      input.endDate = new Date(currentEnd!);
    }
  }

  if (data.registrationOpenDate !== undefined) {
    input.registrationOpenDate = data.registrationOpenDate
      ? new Date(data.registrationOpenDate)
      : null;
  }
  if (data.registrationCloseDate !== undefined) {
    input.registrationCloseDate = data.registrationCloseDate
      ? new Date(data.registrationCloseDate)
      : null;
  }

  try {
    const event = await updateEvent(id, input);
    return NextResponse.json({ event });
  } catch (error) {
    if (error instanceof EventNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof SlugAlreadyTakenError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    console.error('[EVENT_UPDATE_FAILURE]', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await authorize();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    await deleteEvent(id);
    return NextResponse.json({ message: 'Event deleted.' });
  } catch (error) {
    if (error instanceof EventNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    console.error('[EVENT_DELETE_FAILURE]', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
