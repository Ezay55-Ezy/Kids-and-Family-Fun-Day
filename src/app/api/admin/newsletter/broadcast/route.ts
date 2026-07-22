import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { requireAdmin } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { sendNewsletterBroadcast } from '@/services/email-service';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try { await requireAdmin(session.user.id); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

  const { subject, body } = await request.json();

  if (!subject || typeof subject !== 'string' || subject.trim().length === 0) {
    return NextResponse.json({ error: 'Subject is required' }, { status: 400 });
  }
  if (!body || typeof body !== 'string' || body.trim().length === 0) {
    return NextResponse.json({ error: 'Body is required' }, { status: 400 });
  }
  if (subject.length > 200) {
    return NextResponse.json({ error: 'Subject must be 200 characters or less' }, { status: 400 });
  }
  if (body.length > 10000) {
    return NextResponse.json({ error: 'Body must be 10,000 characters or less' }, { status: 400 });
  }

  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: { isActive: true },
    select: { id: true, email: true },
  });

  if (subscribers.length === 0) {
    return NextResponse.json({ error: 'No active subscribers to send to' }, { status: 400 });
  }

  const result = await sendNewsletterBroadcast(subject.trim(), body.trim(), subscribers);

  return NextResponse.json({
    sent: result.sent,
    failed: result.failed,
    errors: result.errors,
    totalRecipients: subscribers.length,
  });
}
