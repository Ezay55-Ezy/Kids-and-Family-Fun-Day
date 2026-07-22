import { prisma } from '@/lib/prisma';
import { SponsorFormData, SponsorFilterData } from '@/validators/sponsor.validator';

export interface SponsorListResult {
  sponsors: Array<{
    id: string;
    companyName: string;
    slug: string;
    description: string | null;
    logoUrl: string | null;
    websiteUrl: string | null;
    tier: string;
    displayOrder: number;
    isPublished: boolean;
    userId: string | null;
    createdAt: Date;
    _count: {
      events: number;
    };
  }>;
  total: number;
  page: number;
  totalPages: number;
}

export async function listSponsors(filters: SponsorFilterData): Promise<SponsorListResult> {
  const where: Record<string, unknown> = {};

  if (filters.query) {
    where.OR = [
      { companyName: { contains: filters.query, mode: 'insensitive' } },
      { slug: { contains: filters.query, mode: 'insensitive' } },
    ];
  }

  if (filters.tier !== 'ALL') {
    where.tier = filters.tier;
  }

  if (filters.status === 'published') {
    where.isPublished = true;
  } else if (filters.status === 'draft') {
    where.isPublished = false;
  }

  const skip = (filters.page - 1) * filters.limit;

  const [sponsors, total] = await Promise.all([
    prisma.sponsor.findMany({
      where,
      select: {
        id: true,
        companyName: true,
        slug: true,
        description: true,
        logoUrl: true,
        websiteUrl: true,
        tier: true,
        displayOrder: true,
        isPublished: true,
        userId: true,
        createdAt: true,
        _count: {
          select: { events: true },
        },
      },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
      skip,
      take: filters.limit,
    }),
    prisma.sponsor.count({ where }),
  ]);

  return {
    sponsors,
    total,
    page: filters.page,
    totalPages: Math.ceil(total / filters.limit),
  };
}

export async function getSponsorById(id: string) {
  return prisma.sponsor.findUnique({
    where: { id },
    select: {
      id: true,
      companyName: true,
      slug: true,
      description: true,
      logoUrl: true,
      websiteUrl: true,
      tier: true,
      displayOrder: true,
      isPublished: true,
      userId: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { events: true } },
      events: {
        select: {
          event: {
            select: { id: true, title: true, slug: true, startDate: true, status: true },
          },
        },
        take: 10,
        orderBy: { event: { startDate: 'desc' } },
      },
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });
}

export async function getSponsorBySlug(slug: string) {
  return prisma.sponsor.findUnique({
    where: { slug },
    select: {
      id: true,
      companyName: true,
      slug: true,
      description: true,
      logoUrl: true,
      websiteUrl: true,
      tier: true,
      displayOrder: true,
      isPublished: true,
    },
  });
}

export async function createSponsor(data: SponsorFormData) {
  return prisma.sponsor.create({
    data: {
      companyName: data.companyName,
      slug: data.slug,
      description: data.description || null,
      logoUrl: data.logoUrl || null,
      websiteUrl: data.websiteUrl || null,
      tier: data.tier,
      displayOrder: data.displayOrder,
      isPublished: data.isPublished,
      ...(data.userId ? { userId: data.userId } : {}),
    },
    select: { id: true, companyName: true, slug: true, isPublished: true },
  });
}

export async function updateSponsor(id: string, data: Partial<SponsorFormData>) {
  const existing = await prisma.sponsor.findUnique({ where: { id } });
  if (!existing) throw new Error('Sponsor not found');

  return prisma.sponsor.update({
    where: { id },
    data: {
      ...(data.companyName !== undefined && { companyName: data.companyName }),
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.description !== undefined && { description: data.description || null }),
      ...(data.logoUrl !== undefined && { logoUrl: data.logoUrl || null }),
      ...(data.websiteUrl !== undefined && { websiteUrl: data.websiteUrl || null }),
      ...(data.tier !== undefined && { tier: data.tier }),
      ...(data.displayOrder !== undefined && { displayOrder: data.displayOrder }),
      ...(data.isPublished !== undefined && { isPublished: data.isPublished }),
      ...(data.userId !== undefined && { userId: data.userId || null }),
    },
    select: { id: true, companyName: true, slug: true, isPublished: true },
  });
}

export async function deleteSponsor(id: string) {
  const existing = await prisma.sponsor.findUnique({
    where: { id },
    select: { _count: { select: { events: true } } },
  });
  if (!existing) throw new Error('Sponsor not found');
  if (existing._count.events > 0) {
    throw new Error('Cannot delete sponsor with linked events. Unlink them first.');
  }

  return prisma.sponsor.delete({ where: { id } });
}

export async function togglePublishSponsor(id: string) {
  const existing = await prisma.sponsor.findUnique({ where: { id } });
  if (!existing) throw new Error('Sponsor not found');

  return prisma.sponsor.update({
    where: { id },
    data: { isPublished: !existing.isPublished },
    select: { id: true, isPublished: true },
  });
}

export async function getPublishedSponsors() {
  return prisma.sponsor.findMany({
    where: { isPublished: true },
    select: {
      id: true,
      companyName: true,
      slug: true,
      description: true,
      logoUrl: true,
      websiteUrl: true,
      tier: true,
      displayOrder: true,
    },
    orderBy: [{ displayOrder: 'asc' }, { companyName: 'asc' }],
  });
}

export async function linkSponsorToEvent(sponsorId: string, eventId: string) {
  const [sponsor, event] = await Promise.all([
    prisma.sponsor.findUnique({ where: { id: sponsorId }, select: { id: true } }),
    prisma.event.findUnique({ where: { id: eventId }, select: { id: true } }),
  ]);
  if (!sponsor) throw new Error('Sponsor not found');
  if (!event) throw new Error('Event not found');

  const existing = await prisma.eventSponsor.findUnique({
    where: { eventId_sponsorId: { eventId, sponsorId } },
  });
  if (existing) throw new Error('Sponsor is already linked to this event');

  return prisma.eventSponsor.create({
    data: { eventId, sponsorId },
    select: { eventId: true, sponsorId: true, createdAt: true },
  });
}

export async function unlinkSponsorFromEvent(sponsorId: string, eventId: string) {
  const existing = await prisma.eventSponsor.findUnique({
    where: { eventId_sponsorId: { eventId, sponsorId } },
  });
  if (!existing) throw new Error('Sponsor is not linked to this event');

  return prisma.eventSponsor.delete({
    where: { eventId_sponsorId: { eventId, sponsorId } },
  });
}

export async function getEventSponsors(eventId: string) {
  return prisma.eventSponsor.findMany({
    where: { eventId },
    include: {
      sponsor: {
        select: {
          id: true,
          companyName: true,
          slug: true,
          logoUrl: true,
          tier: true,
          isPublished: true,
        },
      },
    },
    orderBy: { sponsor: { displayOrder: 'asc' } },
  });
}

export async function getSponsorStats() {
  const [total, published, byTier] = await Promise.all([
    prisma.sponsor.count(),
    prisma.sponsor.count({ where: { isPublished: true } }),
    prisma.sponsor.groupBy({
      by: ['tier'],
      _count: true,
    }),
  ]);

  return {
    total,
    published,
    draft: total - published,
    byTier: byTier.map((t) => ({ tier: t.tier, count: t._count })),
  };
}
