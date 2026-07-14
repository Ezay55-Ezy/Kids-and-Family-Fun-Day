import { z } from 'zod';

export const reportTypeSchema = z.enum(['events', 'bookings', 'users', 'vendors', 'reviews']);

export type ReportType = z.infer<typeof reportTypeSchema>;

export const reportFilterSchema = z.object({
  type: reportTypeSchema,
  query: z.string().trim().optional(),
  status: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  eventId: z.string().optional(),
  vendorId: z.string().optional(),
  role: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type ReportFilterData = z.infer<typeof reportFilterSchema>;

export const reportExportSchema = z.object({
  type: reportTypeSchema,
  format: z.enum(['csv', 'xlsx']),
  query: z.string().trim().optional(),
  status: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  eventId: z.string().optional(),
  vendorId: z.string().optional(),
  role: z.string().optional(),
});

export type ReportExportData = z.infer<typeof reportExportSchema>;
