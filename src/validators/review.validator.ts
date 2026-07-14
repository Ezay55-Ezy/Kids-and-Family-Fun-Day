import { z } from 'zod';

export const createReviewSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  rating: z.number().int().min(1, 'Rating must be between 1 and 5').max(5, 'Rating must be between 1 and 5'),
  comment: z.string().max(2000, 'Comment must be 2000 characters or fewer').optional(),
});
