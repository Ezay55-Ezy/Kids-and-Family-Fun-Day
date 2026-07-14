import { prisma } from '@/lib/prisma';
import { NewsletterFilterData } from '@/validators/newsletter.validator';

export interface SubscriberListResult {
  subscribers: Array<{
    id: string;
    email: string;
    subscribedAt: Date;
    isActive: boolean;
  }>;
  total: number;
  page: number;
  totalPages: number;
}

export async function listSubscribers(filters: NewsletterFilterData): Promise<SubscriberListResult> {
  const where: Record<string, unknown> = {};

  if (filters.query) {
    where.email = { contains: filters.query, mode: 'insensitive' };
  }

  if (filters.status === 'active') {
    where.isActive = true;
  } else if (filters.status === 'inactive') {
    where.isActive = false;
  }

  const skip = (filters.page - 1) * filters.limit;

  const [subscribers, total] = await Promise.all([
    prisma.newsletterSubscriber.findMany({
      where,
      orderBy: { subscribedAt: 'desc' },
      skip,
      take: filters.limit,
    }),
    prisma.newsletterSubscriber.count({ where }),
  ]);

  return {
    subscribers,
    total,
    page: filters.page,
    totalPages: Math.ceil(total / filters.limit),
  };
}

export async function subscribe(email: string) {
  const existing = await prisma.newsletterSubscriber.findUnique({
    where: { email },
  });

  if (existing) {
    if (!existing.isActive) {
      return prisma.newsletterSubscriber.update({
        where: { email },
        data: { isActive: true, subscribedAt: new Date() },
      });
    }
    throw new Error('This email is already subscribed');
  }

  return prisma.newsletterSubscriber.create({
    data: { email },
  });
}

export async function unsubscribe(email: string) {
  const existing = await prisma.newsletterSubscriber.findUnique({
    where: { email },
  });

  if (!existing) throw new Error('Subscriber not found');

  return prisma.newsletterSubscriber.update({
    where: { email },
    data: { isActive: false },
  });
}

export async function deleteSubscriber(id: string) {
  const existing = await prisma.newsletterSubscriber.findUnique({ where: { id } });
  if (!existing) throw new Error('Subscriber not found');

  return prisma.newsletterSubscriber.delete({ where: { id } });
}

export async function getSubscriberStats() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [total, active, recent30, recent7] = await Promise.all([
    prisma.newsletterSubscriber.count(),
    prisma.newsletterSubscriber.count({ where: { isActive: true } }),
    prisma.newsletterSubscriber.count({ where: { subscribedAt: { gte: thirtyDaysAgo } } }),
    prisma.newsletterSubscriber.count({ where: { subscribedAt: { gte: sevenDaysAgo } } }),
  ]);

  return {
    total,
    active,
    inactive: total - active,
    recent30Days: recent30,
    recent7Days: recent7,
  };
}

export async function exportSubscribers() {
  return prisma.newsletterSubscriber.findMany({
    where: { isActive: true },
    orderBy: { subscribedAt: 'desc' },
    select: {
      email: true,
      subscribedAt: true,
    },
  });
}
