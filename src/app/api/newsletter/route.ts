import { NextResponse } from 'next/server';
import { subscribe } from '@/services/newsletter-service';
import { newsletterSubscribeSchema } from '@/validators/newsletter.validator';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'anonymous';
  const { allowed, retryAfterMs } = await checkRateLimit(`newsletter:subscribe:${ip}`, 5, 60_000);

  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) } },
    );
  }

  const body = await request.json();
  const result = newsletterSubscribeSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
  }

  try {
    await subscribe(result.data.email);
    return NextResponse.json({ success: true, message: 'Successfully subscribed!' });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
