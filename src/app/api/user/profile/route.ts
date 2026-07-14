import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { profileUpdateSchema, passwordChangeSchema } from '@/validators/user.validator';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      image: true,
      createdAt: true,
      updatedAt: true,
      passwordHash: true,
      _count: {
        select: {
          bookings: true,
          tickets: true,
          reviews: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({
    ...user,
    hasPassword: !!user.passwordHash,
    passwordHash: undefined,
  });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = profileUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('[PROFILE_UPDATE]', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = passwordChangeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (!user.passwordHash) {
    return NextResponse.json(
      { error: 'Your account uses social login. Password change is not available.' },
      { status: 400 }
    );
  }

  const isValid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!isValid) {
    return NextResponse.json(
      { error: 'Current password is incorrect' },
      { status: 400 }
    );
  }

  const newPasswordHash = await bcrypt.hash(parsed.data.newPassword, 12);

  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash: newPasswordHash },
  });

  return NextResponse.json({ message: 'Password updated successfully' });
}
