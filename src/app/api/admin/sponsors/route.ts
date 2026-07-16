import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { requireAdmin } from '@/lib/auth-utils';
import { listSponsors, createSponsor, getSponsorStats } from '@/services/sponsor-service';
import { sponsorFilterSchema, sponsorSchema } from '@/validators/sponsor.validator';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try { await requireAdmin(session.user.id); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

  const { searchParams } = new URL(request.url);
  const parsed = sponsorFilterSchema.safeParse({
    query: searchParams.get('query') || undefined,
    tier: searchParams.get('tier') || 'ALL',
    status: searchParams.get('status') || 'ALL',
    page: searchParams.get('page') || 1,
    limit: searchParams.get('limit') || 10,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid filters', details: parsed.error.flatten() }, { status: 400 });
  }
  const filters = parsed.data;

  const [result, stats] = await Promise.all([
    listSponsors(filters),
    getSponsorStats(),
  ]);

  return NextResponse.json({ ...result, stats });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try { await requireAdmin(session.user.id); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

  const body = await request.json();
  const parsed = sponsorSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body', details: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  try {
    const sponsor = await createSponsor(data);
    return NextResponse.json(sponsor, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
