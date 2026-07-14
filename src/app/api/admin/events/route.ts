import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { requireAdmin } from '@/lib/auth-utils';
import { eventSchema, buildEventDates } from '@/validators/event.validator';
import {
  listEvents,
  createEvent,
  SlugAlreadyTakenError,
} from '@/services/event-service';

async function authorizeAdmin(sessionUserId?: string): Promise<NextResponse | null> {
  if (!sessionUserId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try { await requireAdmin(sessionUserId); return null; } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
}

export async function GET(request: Request) {
  const session = await auth();
  const authError = await authorizeAdmin(session?.user?.id);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const filters = {
    status: searchParams.get('status') || undefined,
    search: searchParams.get('search') || undefined,
  };

  const events = await listEvents(filters);
  return NextResponse.json({ events });
}

export async function POST(request: Request) {
  const session = await auth();
  const authError = await authorizeAdmin(session?.user?.id);
  if (authError) return authError;

  const json = await request.json();
  const parsed = eventSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const { startDateTime, endDateTime, registrationOpen, registrationClose } =
    buildEventDates(data);

  try {
    const event = await createEvent({
      title: data.title,
      slug: data.slug,
      shortDescription: data.shortDescription || undefined,
      description: data.description,
      startDate: startDateTime,
      endDate: endDateTime,
      location: data.location,
      bannerImageUrl: data.bannerImageUrl || undefined,
      capacity: data.capacity,
      registrationOpenDate: registrationOpen,
      registrationCloseDate: registrationClose,
      status: data.status,
      createdById: session.user.id,
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    if (error instanceof SlugAlreadyTakenError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    console.error('[EVENT_CREATE_FAILURE]', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
