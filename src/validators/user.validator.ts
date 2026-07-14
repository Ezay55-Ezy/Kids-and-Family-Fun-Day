import { z } from 'zod';

export const userUpdateSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100).optional(),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().trim().optional().or(z.literal('')),
  role: z.enum(['ADMIN', 'VENDOR', 'CUSTOMER', 'SPONSOR']).optional(),
  isActive: z.boolean().optional(),
});

export type UserUpdateData = z.infer<typeof userUpdateSchema>;

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().trim().optional().or(z.literal('')),
});

export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type PasswordChangeData = z.infer<typeof passwordChangeSchema>;

export const userFilterSchema = z.object({
  query: z.string().trim().optional(),
  role: z.enum(['ADMIN', 'VENDOR', 'CUSTOMER', 'SPONSOR', 'ALL']).default('ALL'),
  status: z.enum(['active', 'inactive', 'ALL']).default('ALL'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
});

export type UserFilterData = z.infer<typeof userFilterSchema>;
