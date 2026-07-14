import { prisma } from '@/lib/prisma';

export async function requireAdmin(sessionUserId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: sessionUserId },
    select: { role: true, isActive: true },
  });

  if (!user || user.role !== 'ADMIN' || !user.isActive) {
    throw new Error('Unauthorized');
  }
}
