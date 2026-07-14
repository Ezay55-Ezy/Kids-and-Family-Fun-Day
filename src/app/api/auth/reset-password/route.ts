import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { resetPasswordSchema } from '@/validators/auth.validator';

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = resetPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { token, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { passwordResetToken: token },
    select: { id: true, passwordResetExpiry: true },
  });

  if (!user || !user.passwordResetExpiry) {
    return NextResponse.json(
      { error: 'Invalid or expired reset link. Please request a new one.' },
      { status: 400 }
    );
  }

  if (new Date() > user.passwordResetExpiry) {
    // Clear the expired token
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordResetToken: null, passwordResetExpiry: null },
    });

    return NextResponse.json(
      { error: 'Reset link has expired. Please request a new one.' },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      passwordResetToken: null,
      passwordResetExpiry: null,
    },
  });

  return NextResponse.json({ message: 'Password reset successfully. You can now sign in.' });
}
