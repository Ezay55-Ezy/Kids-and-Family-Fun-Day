import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { subscribeUser } from '@/services/push-service';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const json = await request.json();
  const { endpoint, keys } = json;

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return NextResponse.json(
      { error: 'Missing endpoint or keys' },
      { status: 400 },
    );
  }

  await subscribeUser(session.user.id, { endpoint, keys });

  return NextResponse.json({ success: true }, { status: 201 });
}
