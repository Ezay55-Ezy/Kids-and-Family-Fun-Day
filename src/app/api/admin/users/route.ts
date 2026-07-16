import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { requireAdmin } from '@/lib/auth-utils';
import { listUsers, getUserStats } from '@/services/user-service';
import { userFilterSchema } from '@/validators/user.validator';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try { await requireAdmin(session.user.id); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

  const { searchParams } = new URL(request.url);
  const parsed = userFilterSchema.safeParse({
    query: searchParams.get('query') || undefined,
    role: searchParams.get('role') || 'ALL',
    status: searchParams.get('status') || 'ALL',
    page: searchParams.get('page') || 1,
    limit: searchParams.get('limit') || 10,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid filters', details: parsed.error.flatten() }, { status: 400 });
  }
  const filters = parsed.data;

  const [result, stats] = await Promise.all([
    listUsers(filters),
    getUserStats(),
  ]);

  return NextResponse.json({ ...result, stats });
}
