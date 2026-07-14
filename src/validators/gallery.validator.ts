import { z } from 'zod';

export const galleryImageSchema = z.object({
  title: z.string().trim().max(200).optional().or(z.literal('')),
  description: z.string().trim().max(1000).optional().or(z.literal('')),
  imageUrl: z.string().min(1, 'Image URL is required'),
  caption: z.string().trim().max(300).optional().or(z.literal('')),
  eventId: z.string().optional().or(z.literal('')),
  displayOrder: z.coerce.number().int().min(0).default(0),
  isPublished: z.boolean().default(true),
});

export const galleryImageUpdateSchema = galleryImageSchema.partial();

export type GalleryImageData = z.infer<typeof galleryImageSchema>;

export const galleryFilterSchema = z.object({
  query: z.string().trim().optional(),
  eventId: z.string().optional(),
  status: z.enum(['published', 'draft', 'ALL']).default('ALL'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
});

export type GalleryFilterData = z.infer<typeof galleryFilterSchema>;
