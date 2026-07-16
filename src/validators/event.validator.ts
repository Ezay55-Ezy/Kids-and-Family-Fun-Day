import { z } from 'zod';

export const eventSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(200),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens only'),
  shortDescription: z.string().trim().max(300).optional().or(z.literal('')),
  description: z.string().trim().min(10, 'Description must be at least 10 characters'),
  startDate: z.string().min(1, 'Start date is required'),
  startTime: z.string().optional().or(z.literal('')),
  endDate: z.string().min(1, 'End date is required'),
  endTime: z.string().optional().or(z.literal('')),
  location: z.string().trim().min(3, 'Location is required').max(500),
  bannerImageUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  capacity: z.coerce.number().int().positive('Capacity must be a positive number'),
  registrationOpenDate: z.string().optional().or(z.literal('')),
  registrationCloseDate: z.string().optional().or(z.literal('')),
  status: z.enum(['DRAFT', 'PUBLISHED', 'SOLD_OUT', 'CANCELLED', 'COMPLETED']).default('DRAFT'),
});

export const eventUpdateSchema = eventSchema.partial();

export type EventFormData = z.infer<typeof eventSchema>;

export function buildEventDates(data: EventFormData) {
  const startDateTime = data.startTime
    ? new Date(`${data.startDate}T${data.startTime}:00`)
    : new Date(`${data.startDate}T00:00:00`);

  const endDateTime = data.endTime
    ? new Date(`${data.endDate}T${data.endTime}:00`)
    : new Date(`${data.endDate}T23:59:59`);

  const registrationOpen = data.registrationOpenDate
    ? new Date(data.registrationOpenDate)
    : null;

  const registrationClose = data.registrationCloseDate
    ? new Date(data.registrationCloseDate)
    : null;

  return { startDateTime, endDateTime, registrationOpen, registrationClose };
}
