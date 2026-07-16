import { prisma } from '@/lib/prisma';
import { GalleryImageData, GalleryFilterData } from '@/validators/gallery.validator';

export interface GalleryListResult {
  images: Array<{
    id: string;
    title: string | null;
    description: string | null;
    imageUrl: string;
    caption: string | null;
    displayOrder: number;
    isPublished: boolean;
    eventId: string | null;
    createdAt: Date;
    _count: { events: number };
    event: { id: string; title: string } | null;
  }>;
  total: number;
  page: number;
  totalPages: number;
}

export async function listGalleryImages(filters: GalleryFilterData): Promise<GalleryListResult> {
  const where: Record<string, unknown> = {};

  if (filters.query) {
    where.OR = [
      { title: { contains: filters.query, mode: 'insensitive' } },
      { caption: { contains: filters.query, mode: 'insensitive' } },
    ];
  }

  if (filters.eventId) {
    where.eventId = filters.eventId;
  }

  if (filters.status === 'published') {
    where.isPublished = true;
  } else if (filters.status === 'draft') {
    where.isPublished = false;
  }

  const skip = (filters.page - 1) * filters.limit;

  const [images, total] = await Promise.all([
    prisma.gallery.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        caption: true,
        displayOrder: true,
        isPublished: true,
        eventId: true,
        createdAt: true,
        _count: { select: { events: true } },
        event: { select: { id: true, title: true } },
      },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
      skip,
      take: filters.limit,
    }),
    prisma.gallery.count({ where }),
  ]);

  return {
    images,
    total,
    page: filters.page,
    totalPages: Math.ceil(total / filters.limit),
  };
}

export async function getGalleryImageById(id: string) {
  return prisma.gallery.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      imageUrl: true,
      caption: true,
      displayOrder: true,
      isPublished: true,
      eventId: true,
      createdAt: true,
      updatedAt: true,
      event: { select: { id: true, title: true, slug: true } },
    },
  });
}

export async function createGalleryImage(data: GalleryImageData) {
  return prisma.gallery.create({
    data: {
      title: data.title || null,
      description: data.description || null,
      imageUrl: data.imageUrl,
      caption: data.caption || null,
      eventId: data.eventId || null,
      displayOrder: data.displayOrder,
      isPublished: data.isPublished,
    },
    select: { id: true, title: true, imageUrl: true, isPublished: true },
  });
}

export async function updateGalleryImage(id: string, data: Partial<GalleryImageData>) {
  const existing = await prisma.gallery.findUnique({ where: { id } });
  if (!existing) throw new Error('Gallery image not found');

  return prisma.gallery.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title || null }),
      ...(data.description !== undefined && { description: data.description || null }),
      ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
      ...(data.caption !== undefined && { caption: data.caption || null }),
      ...(data.eventId !== undefined && { eventId: data.eventId || null }),
      ...(data.displayOrder !== undefined && { displayOrder: data.displayOrder }),
      ...(data.isPublished !== undefined && { isPublished: data.isPublished }),
    },
    select: { id: true, title: true, imageUrl: true, isPublished: true },
  });
}

export async function deleteGalleryImage(id: string) {
  const existing = await prisma.gallery.findUnique({ where: { id } });
  if (!existing) throw new Error('Gallery image not found');

  return prisma.gallery.delete({ where: { id } });
}

export async function togglePublishGalleryImage(id: string) {
  const existing = await prisma.gallery.findUnique({ where: { id } });
  if (!existing) throw new Error('Gallery image not found');

  return prisma.gallery.update({
    where: { id },
    data: { isPublished: !existing.isPublished },
    select: { id: true, isPublished: true },
  });
}

export async function getPublishedGalleryImages(eventId?: string, limit = 30, offset = 0) {
  const where: Record<string, unknown> = { isPublished: true };
  if (eventId) where.eventId = eventId;

  const [images, total] = await Promise.all([
    prisma.gallery.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        caption: true,
        displayOrder: true,
        createdAt: true,
        event: { select: { id: true, title: true, slug: true } },
      },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
      take: limit,
      skip: offset,
    }),
    prisma.gallery.count({ where }),
  ]);

  return { images, total, limit, offset };
}

export async function getGalleryStats() {
  const [total, published, withEvent] = await Promise.all([
    prisma.gallery.count(),
    prisma.gallery.count({ where: { isPublished: true } }),
    prisma.gallery.count({ where: { eventId: { not: null } } }),
  ]);

  return {
    total,
    published,
    draft: total - published,
    withEvent,
    standalone: total - withEvent,
  };
}
