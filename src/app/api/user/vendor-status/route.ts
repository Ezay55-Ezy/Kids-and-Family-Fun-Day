import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ hasVendorProfile: false });
  }

  const vendor = await prisma.vendor.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  return NextResponse.json({ hasVendorProfile: !!vendor });
}
