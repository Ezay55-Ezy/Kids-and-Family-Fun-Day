import { prisma } from '@/lib/prisma';

export async function requireAdmin(sessionUserId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: sessionUserId },
    select: { role: true },
  });

  if (!user || user.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }
}
