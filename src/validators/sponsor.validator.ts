import { z } from 'zod';

export const sponsorSchema = z.object({
  companyName: z.string().trim().min(2, 'Company name is required').max(200),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens only'),
  description: z.string().trim().max(1000).optional().or(z.literal('')),
  logoUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  websiteUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  tier: z.enum(['PLATINUM', 'GOLD', 'SILVER', 'BRONZE']).default('BRONZE'),
  displayOrder: z.coerce.number().int().min(0).default(0),
  isPublished: z.boolean().default(true),
  userId: z.string().optional().or(z.literal('')),
});

export const sponsorUpdateSchema = sponsorSchema.partial();

export type SponsorFormData = z.infer<typeof sponsorSchema>;

export const sponsorFilterSchema = z.object({
  query: z.string().trim().optional(),
  tier: z.enum(['PLATINUM', 'GOLD', 'SILVER', 'BRONZE', 'ALL']).default('ALL'),
  status: z.enum(['published', 'draft', 'ALL']).default('ALL'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
});

export type SponsorFilterData = z.infer<typeof sponsorFilterSchema>;
