import { NextResponse } from 'next/server';
import { subscribe } from '@/services/newsletter-service';
import { newsletterSubscribeSchema } from '@/validators/newsletter.validator';

export async function POST(request: Request) {
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
