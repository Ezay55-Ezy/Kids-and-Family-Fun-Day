import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { requireAdmin } from '@/lib/auth-utils';
import { listSubscribers, getSubscriberStats } from '@/services/newsletter-service';
import { newsletterFilterSchema } from '@/validators/newsletter.validator';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try { await requireAdmin(session.user.id); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

  const { searchParams } = new URL(request.url);
  const filters = newsletterFilterSchema.parse({
    query: searchParams.get('query') || undefined,
    status: searchParams.get('status') || 'ALL',
    page: searchParams.get('page') || 1,
    limit: searchParams.get('limit') || 10,
  });

  const [result, stats] = await Promise.all([
    listSubscribers(filters),
    getSubscriberStats(),
  ]);

  return NextResponse.json({ ...result, stats });
}
