import { z } from 'zod';

export const ticketTypeSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200),
  description: z.string().trim().max(1000).optional().or(z.literal('')),
  price: z.coerce.number().min(0, 'Price must be 0 or greater'),
  capacity: z.coerce.number().int().min(0, 'Capacity must be 0 or greater'),
});

export const ticketTypeUpdateSchema = ticketTypeSchema.partial();

export type TicketTypeFormData = z.infer<typeof ticketTypeSchema>;
