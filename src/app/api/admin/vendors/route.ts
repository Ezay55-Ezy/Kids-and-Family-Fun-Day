import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { requireAdmin } from '@/lib/auth-utils';
import { VendorStatus } from '@/generated/prisma/enums';
import { listVendors } from '@/services/vendor-service';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try { await requireAdmin(session.user.id); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') as VendorStatus | null;
  const search = searchParams.get('search');

  if (status && !['PENDING_REVIEW', 'APPROVED_AWAITING_PAYMENT', 'ACTIVE', 'REJECTED'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status filter' }, { status: 400 });
  }

  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

  const result = await listVendors({
    status: status || undefined,
    search: search || undefined,
    page,
    limit,
  });

  return NextResponse.json(result);
}
