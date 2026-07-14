import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { unsubscribeUser } from '@/services/push-service';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const json = await request.json();
  const { endpoint } = json;

  if (!endpoint) {
    return NextResponse.json({ error: 'Missing endpoint' }, { status: 400 });
  }

  await unsubscribeUser(session.user.id, endpoint);

  return NextResponse.json({ success: true });
}
