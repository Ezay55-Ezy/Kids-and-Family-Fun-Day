import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { requireAdmin } from '@/lib/auth-utils';
import { getSponsorById, updateSponsor, deleteSponsor } from '@/services/sponsor-service';
import { sponsorUpdateSchema } from '@/validators/sponsor.validator';

export async function GET(_request: Request, { params }: { params: Promise<{ sponsorId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try { await requireAdmin(session.user.id); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

  const { sponsorId } = await params;
  const sponsor = await getSponsorById(sponsorId);
  if (!sponsor) return NextResponse.json({ error: 'Sponsor not found' }, { status: 404 });

  return NextResponse.json(sponsor);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ sponsorId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try { await requireAdmin(session.user.id); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

  const { sponsorId } = await params;
  const body = await request.json();
  const data = sponsorUpdateSchema.parse(body);

  try {
    const sponsor = await updateSponsor(sponsorId, data);
    return NextResponse.json(sponsor);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ sponsorId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try { await requireAdmin(session.user.id); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

  const { sponsorId } = await params;

  try {
    await deleteSponsor(sponsorId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
