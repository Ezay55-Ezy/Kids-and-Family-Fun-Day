import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { requireAdmin } from '@/lib/auth-utils';
import { ticketTypeUpdateSchema } from '@/validators/ticket-type.validator';
import {
  getTicketType,
  updateTicketType,
  deleteTicketType,
  TicketTypeNotFoundError,
} from '@/services/ticket-type-service';

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
    const ticketType = await getTicketType(id);
    return NextResponse.json({ ticketType });
  } catch (error) {
    if (error instanceof TicketTypeNotFoundError) {
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
  const parsed = ticketTypeUpdateSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const input: Record<string, unknown> = {};

  if (data.name !== undefined) input.name = data.name;
  if (data.description !== undefined) input.description = data.description || null;
  if (data.price !== undefined) input.price = data.price;
  if (data.capacity !== undefined) input.capacity = data.capacity;

  try {
    const ticketType = await updateTicketType(id, input);
    return NextResponse.json({ ticketType });
  } catch (error) {
    if (error instanceof TicketTypeNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    console.error('[TICKET_TYPE_UPDATE_FAILURE]', error);
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
    await deleteTicketType(id);
    return NextResponse.json({ message: 'Ticket type deleted.' });
  } catch (error) {
    if (error instanceof TicketTypeNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    console.error('[TICKET_TYPE_DELETE_FAILURE]', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
