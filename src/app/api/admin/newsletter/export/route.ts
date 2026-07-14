import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { requireAdmin } from '@/lib/auth-utils';
import { exportSubscribers } from '@/services/newsletter-service';
import { escapeCsvField } from '@/lib/format';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try { await requireAdmin(session.user.id); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

  const subscribers = await exportSubscribers();

  const header = 'Email,Subscribed At\n';
  const rows = subscribers.map(
    (s) => `${escapeCsvField(s.email)},${escapeCsvField(s.subscribedAt.toISOString())}`
  ).join('\n');

  return new NextResponse(header + rows, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="subscribers-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
