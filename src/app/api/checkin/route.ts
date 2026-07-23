import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { validateTicketCode } from '@/services/booking-service';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!user || (user.role !== 'ADMIN' && user.role !== 'VENDOR')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const json = await request.json();
  const { ticketCode } = json;

  if (!ticketCode || typeof ticketCode !== 'string') {
    return NextResponse.json({ error: 'Missing ticketCode' }, { status: 400 });
  }

  const outcome = await validateTicketCode(ticketCode.trim());
  return NextResponse.json(outcome);
}
