import { prisma } from '@/lib/prisma';
import { UserUpdateData, UserFilterData } from '@/validators/user.validator';

export interface UserListResult {
  users: Array<{
    id: string;
    name: string;
    email: string;
    phone: string | null;
    role: string;
    isActive: boolean;
    suspendedAt: Date | null;
    image: string | null;
    createdAt: Date;
    _count: {
      bookings: number;
      reviews: number;
    };
  }>;
  total: number;
  page: number;
  totalPages: number;
}

export async function listUsers(filters: UserFilterData): Promise<UserListResult> {
  const where: Record<string, unknown> = {};

  if (filters.query) {
    where.OR = [
      { name: { contains: filters.query, mode: 'insensitive' } },
      { email: { contains: filters.query, mode: 'insensitive' } },
    ];
  }

  if (filters.role !== 'ALL') {
    where.role = filters.role;
  }

  if (filters.status === 'active') {
    where.isActive = true;
  } else if (filters.status === 'inactive') {
    where.isActive = false;
  }

  const skip = (filters.page - 1) * filters.limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        suspendedAt: true,
        image: true,
        createdAt: true,
        _count: {
          select: {
            bookings: true,
            reviews: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: filters.limit,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    total,
    page: filters.page,
    totalPages: Math.ceil(total / filters.limit),
  };
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      suspendedAt: true,
      image: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          bookings: true,
          reviews: true,
          tickets: true,
          notifications: true,
        },
      },
      bookings: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          ticketCode: true,
          totalAmount: true,
          status: true,
          createdAt: true,
          event: { select: { title: true } },
        },
      },
      reviews: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          rating: true,
          comment: true,
          status: true,
          createdAt: true,
        },
      },
    },
  });
}

export async function updateUser(id: string, data: UserUpdateData) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error('User not found');

  return prisma.user.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.email !== undefined && { email: data.email }),
      ...(data.phone !== undefined && { phone: data.phone || null }),
      ...(data.role !== undefined && { role: data.role }),
      ...(data.isActive !== undefined && {
        isActive: data.isActive,
        suspendedAt: data.isActive ? null : new Date(),
      }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      suspendedAt: true,
    },
  });
}

export async function suspendUser(id: string, currentUserId: string) {
  if (id === currentUserId) {
    throw new Error('Cannot suspend your own account');
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error('User not found');
  if (!user.isActive) throw new Error('User is already suspended');

  // If suspending an admin, check they're not the last active admin
  if (user.role === 'ADMIN') {
    const activeAdminCount = await prisma.user.count({
      where: { role: 'ADMIN', isActive: true },
    });
    if (activeAdminCount <= 1) {
      throw new Error('Cannot suspend the last active admin');
    }
  }

  return prisma.user.update({
    where: { id },
    data: { isActive: false, suspendedAt: new Date() },
    select: { id: true, name: true, isActive: true, suspendedAt: true },
  });
}

export async function reactivateUser(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error('User not found');
  if (user.isActive) throw new Error('User is already active');

  return prisma.user.update({
    where: { id },
    data: { isActive: true, suspendedAt: null },
    select: { id: true, name: true, isActive: true, suspendedAt: true },
  });
}

export async function getUserStats() {
  const [total, active, byRole] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.user.groupBy({
      by: ['role'],
      _count: true,
    }),
  ]);

  return {
    total,
    active,
    inactive: total - active,
    byRole: byRole.map((r) => ({ role: r.role, count: r._count })),
  };
}
