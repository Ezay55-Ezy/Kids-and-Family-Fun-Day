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
  const filters = sponsorFilterSchema.parse({
    query: searchParams.get('query') || undefined,
    tier: searchParams.get('tier') || 'ALL',
    status: searchParams.get('status') || 'ALL',
    page: searchParams.get('page') || 1,
    limit: searchParams.get('limit') || 10,
  });

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
  const data = sponsorSchema.parse(body);

  try {
    const sponsor = await createSponsor(data);
    return NextResponse.json(sponsor, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
