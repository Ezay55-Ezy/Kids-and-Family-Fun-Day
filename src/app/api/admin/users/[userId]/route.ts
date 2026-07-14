import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { requireAdmin } from '@/lib/auth-utils';
import { getUserById, updateUser } from '@/services/user-service';
import { userUpdateSchema } from '@/validators/user.validator';

export async function GET(_request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try { await requireAdmin(session.user.id); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

  const { userId } = await params;
  const user = await getUserById(userId);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  return NextResponse.json(user);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try { await requireAdmin(session.user.id); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

  const { userId } = await params;
  const body = await request.json();
  const data = userUpdateSchema.parse(body);

  try {
    const user = await updateUser(userId, data);
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
