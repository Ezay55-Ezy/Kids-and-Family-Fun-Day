import { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';

export class EventNotFoundError extends Error {
  constructor() {
    super('Event not found.');
    this.name = 'EventNotFoundError';
  }
}

export class SlugAlreadyTakenError extends Error {
  constructor() {
    super('An event with this slug already exists.');
    this.name = 'SlugAlreadyTakenError';
  }
}

export type EventListFilters = {
  status?: string;
  search?: string;
};

const eventInclude = {
  createdBy: { select: { id: true, name: true, email: true } },
  category: { select: { id: true, name: true, slug: true } },
};

export async function listEvents(filters?: EventListFilters) {
  const where: Prisma.EventWhereInput = {};

  if (filters?.status) {
    where.status = filters.status as Prisma.EnumEventStatusFilter['equals'];
  }

  if (filters?.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { slug: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  return prisma.event.findMany({
    where,
    include: eventInclude,
    orderBy: { createdAt: 'desc' },
  });
}

export type PublishedEventsSort = 'newest' | 'soonest' | 'oldest';
export type PublishedEventsFilter = 'all' | 'upcoming' | 'past';

export async function listPublishedEvents(params?: {
  search?: string;
  sort?: PublishedEventsSort;
  timeframe?: PublishedEventsFilter;
}) {
  const where: Prisma.EventWhereInput = {
    status: 'PUBLISHED',
  };

  const search = params?.search?.trim();
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { location: { contains: search, mode: 'insensitive' } },
    ];
  }

  const now = new Date();
  if (params?.timeframe === 'upcoming') {
    where.startDate = { gte: now };
  } else if (params?.timeframe === 'past') {
    where.startDate = { lt: now };
  }

  let orderBy: Prisma.EventOrderByWithRelationInput;
  switch (params?.sort) {
    case 'soonest':
      orderBy = { startDate: 'asc' };
      break;
    case 'oldest':
      orderBy = { startDate: 'desc' };
      break;
    case 'newest':
    default:
      orderBy = { createdAt: 'desc' };
      break;
  }

  return prisma.event.findMany({
    where,
    include: eventInclude,
    orderBy,
  });
}

export async function getEvent(id: string) {
  const event = await prisma.event.findUnique({
    where: { id },
    include: eventInclude,
  });

  if (!event) throw new EventNotFoundError();
  return event;
}

const detailInclude = {
  ...eventInclude,
  ticketTypes: {
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      capacity: true,
      ticketsSold: true,
    },
    orderBy: { createdAt: 'asc' as const },
  },
  sponsors: {
    where: { sponsor: { isPublished: true } },
    include: {
      sponsor: {
        select: {
          id: true,
          companyName: true,
          logoUrl: true,
          tier: true,
          websiteUrl: true,
        },
      },
    },
    orderBy: [{ sponsor: { displayOrder: 'asc' as const } }],
  },
  gallery: {
    where: { isPublished: true },
    select: { id: true, title: true, description: true, imageUrl: true, caption: true, displayOrder: true },
    orderBy: { displayOrder: 'asc' as const },
  },
  reviews: {
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      user: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' as const },
  },
};

export async function getPublishedEventBySlug(slug: string) {
  const event = await prisma.event.findUnique({
    where: { slug },
    include: detailInclude,
  });

  if (!event || event.status !== 'PUBLISHED') throw new EventNotFoundError();
  return event;
}

export async function listRelatedEvents(eventId: string, limit = 3) {
  const now = new Date();

  return prisma.event.findMany({
    where: {
      id: { not: eventId },
      status: 'PUBLISHED',
      startDate: { gte: now },
    },
    include: eventInclude,
    orderBy: { startDate: 'asc' },
    take: limit,
  });
}

export interface CreateEventInput {
  title: string;
  slug: string;
  shortDescription?: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  bannerImageUrl?: string;
  capacity: number;
  registrationOpenDate?: Date | null;
  registrationCloseDate?: Date | null;
  status?: string;
  createdById: string;
}

export async function createEvent(input: CreateEventInput) {
  try {
    return await prisma.event.create({
      data: {
        title: input.title,
        slug: input.slug,
        shortDescription: input.shortDescription || null,
        description: input.description,
        startDate: input.startDate,
        endDate: input.endDate,
        location: input.location,
        bannerImageUrl: input.bannerImageUrl || null,
        ticketPrice: 0,
        capacity: input.capacity,
        registrationOpenDate: input.registrationOpenDate || null,
        registrationCloseDate: input.registrationCloseDate || null,
        status: (input.status as Prisma.EnumEventStatusFilter['equals']) || 'DRAFT',
        createdById: input.createdById,
      },
      include: eventInclude,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new SlugAlreadyTakenError();
    }
    throw error;
  }
}

export interface UpdateEventInput {
  title?: string;
  slug?: string;
  shortDescription?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  location?: string;
  bannerImageUrl?: string;
  capacity?: number;
  registrationOpenDate?: Date | null;
  registrationCloseDate?: Date | null;
  status?: string;
}

export async function updateEvent(id: string, input: UpdateEventInput) {
  const existing = await prisma.event.findUnique({ where: { id } });
  if (!existing) throw new EventNotFoundError();

  const data: Prisma.EventUpdateInput = {};

  if (input.title !== undefined) data.title = input.title;
  if (input.slug !== undefined) data.slug = input.slug;
  if (input.shortDescription !== undefined) data.shortDescription = input.shortDescription || null;
  if (input.description !== undefined) data.description = input.description;
  if (input.startDate !== undefined) data.startDate = input.startDate;
  if (input.endDate !== undefined) data.endDate = input.endDate;
  if (input.location !== undefined) data.location = input.location;
  if (input.bannerImageUrl !== undefined) data.bannerImageUrl = input.bannerImageUrl || null;
  if (input.capacity !== undefined) data.capacity = input.capacity;
  if (input.registrationOpenDate !== undefined) data.registrationOpenDate = input.registrationOpenDate;
  if (input.registrationCloseDate !== undefined) data.registrationCloseDate = input.registrationCloseDate;
  if (input.status !== undefined) data.status = input.status as Prisma.EnumEventStatusFilter['equals'];

  try {
    return await prisma.event.update({
      where: { id },
      data,
      include: eventInclude,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new SlugAlreadyTakenError();
    }
    throw error;
  }
}

export async function deleteEvent(id: string) {
  const existing = await prisma.event.findUnique({ where: { id } });
  if (!existing) throw new EventNotFoundError();

  await prisma.event.delete({ where: { id } });
}
