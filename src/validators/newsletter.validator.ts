import { z } from 'zod';

export const newsletterSubscribeSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export type NewsletterSubscribeData = z.infer<typeof newsletterSubscribeSchema>;

export const newsletterFilterSchema = z.object({
  query: z.string().trim().optional(),
  status: z.enum(['active', 'inactive', 'ALL']).default('ALL'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
});

export type NewsletterFilterData = z.infer<typeof newsletterFilterSchema>;
