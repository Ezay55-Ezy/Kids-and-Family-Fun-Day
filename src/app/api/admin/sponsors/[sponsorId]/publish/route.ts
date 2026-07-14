import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { requireAdmin } from '@/lib/auth-utils';
import { togglePublishSponsor } from '@/services/sponsor-service';

export async function POST(_request: Request, { params }: { params: Promise<{ sponsorId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try { await requireAdmin(session.user.id); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

  const { sponsorId } = await params;

  try {
    const sponsor = await togglePublishSponsor(sponsorId);
    return NextResponse.json(sponsor);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
