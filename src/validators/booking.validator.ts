import { z } from 'zod';

export const bookingItemSchema = z.object({
  ticketTypeId: z.string().min(1, 'Ticket type is required'),
  quantity: z.coerce.number().int().positive('Quantity must be at least 1'),
});

export const bookingSchema = z.object({
  eventId: z.string().min(1, 'Event is required'),
  items: z.array(bookingItemSchema).min(1, 'At least one item is required'),
});

export type BookingFormData = z.infer<typeof bookingSchema>;
