import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { requireAdmin } from '@/lib/auth-utils';
import { ticketTypeSchema } from '@/validators/ticket-type.validator';
import { listTicketTypes, createTicketType } from '@/services/ticket-type-service';
import { getEvent, EventNotFoundError } from '@/services/event-service';

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
    await getEvent(id);
  } catch (error) {
    if (error instanceof EventNotFoundError) {
      return NextResponse.json({ error: 'Event not found.' }, { status: 404 });
    }
    throw error;
  }

  const ticketTypes = await listTicketTypes(id);
  return NextResponse.json({ ticketTypes });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await authorize();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    await getEvent(id);
  } catch (error) {
    if (error instanceof EventNotFoundError) {
      return NextResponse.json({ error: 'Event not found.' }, { status: 404 });
    }
    throw error;
  }

  const json = await request.json();
  const parsed = ticketTypeSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const ticketType = await createTicketType({
    ...parsed.data,
    eventId: id,
  });

  return NextResponse.json({ ticketType }, { status: 201 });
}
