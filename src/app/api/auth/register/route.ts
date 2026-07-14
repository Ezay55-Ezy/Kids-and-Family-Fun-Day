import { NextResponse } from 'next/server';
import { registerSchema } from '@/validators/auth.validator';
import { registerUser, EmailAlreadyInUseError } from '@/services/auth-service';

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = registerSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    await registerUser(parsed.data);
    return NextResponse.json(
      { message: 'Account created.' },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof EmailAlreadyInUseError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    console.error('[USER_REGISTRATION_FAILURE]', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
