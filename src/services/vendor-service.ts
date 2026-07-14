import { Prisma } from '@/generated/prisma/client';
import { ServiceCategory, PricingType, VendorStatus } from '@/generated/prisma/enums';
import { prisma } from '@/lib/prisma';

export class VendorAlreadyExistsError extends Error {
  constructor() {
    super('A vendor profile already exists for this user.');
    this.name = 'VendorAlreadyExistsError';
  }
}

export class VendorNotFoundError extends Error {
  constructor() {
    super('Vendor profile not found.');
    this.name = 'VendorNotFoundError';
  }
}

export class VendorNotPendingReviewError extends Error {
  constructor(status: string) {
    super(`Vendor application is ${status.toLowerCase()}, not pending review.`);
    this.name = 'VendorNotPendingReviewError';
  }
}

export class VendorNotAwaitingPaymentError extends Error {
  constructor(status: string) {
    super(`Vendor is ${status.toLowerCase()}, not awaiting payment.`);
    this.name = 'VendorNotAwaitingPaymentError';
  }
}

export class VendorNotActiveError extends Error {
  constructor(status: string) {
    super(`Vendor account is ${status.toLowerCase()}. Only active vendors can manage services.`);
    this.name = 'VendorNotActiveError';
  }
}

export class ServiceNotFoundError extends Error {
  constructor() {
    super('Service not found.');
    this.name = 'ServiceNotFoundError';
  }
}

export class ServiceOwnershipMismatchError extends Error {
  constructor() {
    super('This service does not belong to you.');
    this.name = 'ServiceOwnershipMismatchError';
  }
}

interface RegisterVendorInput {
  userId: string;
  businessName: string;
  description?: string;
  serviceName: string;
  price: number;
  serviceDescription?: string;
}

/**
 * Registers a user as a vendor and creates their first service listing.
 *
 * Role handling: we only promote CUSTOMER -> VENDOR. A user who is already
 * ADMIN (or any other role) keeps that role — vendor *capability* comes from
 * the existence of the Vendor record itself, not from overwriting `role`.
 * Downstream authorization checks should check `!!user.vendor` where relevant,
 * not assume role === 'VENDOR' is the only way to have vendor access.
 */
export async function registerVendor(input: RegisterVendorInput) {
  const { userId, businessName, description, serviceName, price, serviceDescription } = input;

  try {
    return await prisma.$transaction(async (tx) => {
      const existing = await tx.vendor.findUnique({ where: { userId } });
      if (existing) {
        throw new VendorAlreadyExistsError();
      }

      const vendor = await tx.vendor.create({
        data: {
          businessName,
          description: description || `We offer ${serviceName} services`,
          status: 'PENDING_REVIEW',
          user: { connect: { id: userId } },
          services: {
            create: {
              name: serviceName,
              price,
              description: serviceDescription || 'Service provided by vendor',
            },
          },
        },
        include: { services: true },
      });

      const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
      if (user.role === 'CUSTOMER') {
        await tx.user.update({
          where: { id: userId },
          data: { role: 'VENDOR' },
        });
      }

      return vendor;
    });
  } catch (error) {
    // Backstop for the race condition the pre-check can't fully close:
    // two concurrent requests can both pass findUnique before either commits.
    // The @unique constraint on Vendor.userId is the real guarantee here.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new VendorAlreadyExistsError();
    }
    throw error;
  }
}

export async function getVendorProfile(userId: string) {
  const vendor = await prisma.vendor.findUnique({
    where: { userId },
    include: {
      services: true,
      _count: { select: { bookings: true } },
    },
  });
  return vendor;
}

export interface VendorDashboardData {
  vendor: NonNullable<Awaited<ReturnType<typeof getVendorProfile>>>;
  recentBookings: Array<{
    id: string;
    status: string;
    totalAmount: number;
    createdAt: Date;
    user: { name: string | null };
  }>;
  totalRevenue: number;
}

export async function getVendorDashboard(userId: string): Promise<VendorDashboardData | null> {
  const vendor = await getVendorProfile(userId);
  if (!vendor) return null;

  const recentBookings = await prisma.booking.findMany({
    where: { vendorId: vendor.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: {
      id: true,
      status: true,
      totalAmount: true,
      createdAt: true,
      user: { select: { name: true } },
    },
  });

  const revenueAgg = await prisma.payment.aggregate({
    where: {
      booking: { vendorId: vendor.id },
      status: 'SUCCESS',
    },
    _sum: { amount: true },
  });

  return {
    vendor: {
      ...vendor,
      services: vendor.services,
      _count: vendor._count,
    },
    recentBookings: recentBookings.map((b) => ({
      id: b.id,
      status: b.status,
      totalAmount: Number(b.totalAmount),
      createdAt: b.createdAt,
      user: b.user,
    })),
    totalRevenue: Number(revenueAgg._sum.amount || 0),
  };
}

export async function listVendors({
  status,
  search,
  page = 1,
  limit = 20,
}: {
  status?: VendorStatus;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const where: Prisma.VendorWhereInput = {};

  if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { businessName: { contains: search, mode: 'insensitive' } },
      { user: { name: { contains: search, mode: 'insensitive' } } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const [vendors, total] = await Promise.all([
    prisma.vendor.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        _count: { select: { services: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.vendor.count({ where }),
  ]);

  return {
    vendors: vendors.map((v) => ({
      ...v,
      createdAt: v.createdAt.toISOString(),
      updatedAt: v.updatedAt.toISOString(),
      approvedAt: v.approvedAt?.toISOString() ?? null,
      activationDate: v.activationDate?.toISOString() ?? null,
      paymentVerifiedAt: v.paymentVerifiedAt?.toISOString() ?? null,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getVendorById(vendorId: string) {
  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    include: {
      user: { select: { id: true, name: true, email: true } },
      services: {
        where: { isActive: true },
        select: { id: true, name: true, description: true, price: true, isActive: true },
      },
    },
  });

  if (!vendor) {
    throw new VendorNotFoundError();
  }

  return {
    ...vendor,
    createdAt: vendor.createdAt.toISOString(),
    updatedAt: vendor.updatedAt.toISOString(),
    approvedAt: vendor.approvedAt?.toISOString() ?? null,
    activationDate: vendor.activationDate?.toISOString() ?? null,
    paymentVerifiedAt: vendor.paymentVerifiedAt?.toISOString() ?? null,
  };
}

export async function approveVendor(vendorId: string, _reviewedBy: string) {
  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    include: { user: { select: { id: true, name: true } } },
  });

  if (!vendor) throw new VendorNotFoundError();
  if (vendor.status !== 'PENDING_REVIEW') throw new VendorNotPendingReviewError(vendor.status);

  await prisma.$transaction(async (tx) => {
    await tx.vendor.update({
      where: { id: vendorId },
      data: { status: 'APPROVED_AWAITING_PAYMENT', approvedAt: new Date() },
    });

    await tx.notification.create({
      data: {
        userId: vendor.userId,
        type: 'VENDOR_STATUS',
        title: 'Vendor Application Approved',
        message: `Congratulations ${vendor.user.name || 'Vendor'}! Your vendor application for "${vendor.businessName}" has been approved. Please complete the participation fee with the event organizer to activate your account.`,
      },
    });
  });
}

export async function activateVendor(vendorId: string, adminUserId: string) {
  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    include: { user: { select: { id: true, name: true } } },
  });

  if (!vendor) throw new VendorNotFoundError();
  if (vendor.status !== 'APPROVED_AWAITING_PAYMENT') throw new VendorNotAwaitingPaymentError(vendor.status);

  await prisma.$transaction(async (tx) => {
    await tx.vendor.update({
      where: { id: vendorId },
      data: {
        status: 'ACTIVE',
        activationDate: new Date(),
        paymentVerifiedAt: new Date(),
        paymentVerifiedById: adminUserId,
      },
    });

    await tx.notification.create({
      data: {
        userId: vendor.userId,
        type: 'VENDOR_STATUS',
        title: 'Vendor Account Activated',
        message: `Your vendor account for "${vendor.businessName}" is now active! You can now create and manage your services.`,
      },
    });
  });
}

async function ensureVendorActive(vendorId: string): Promise<void> {
  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    select: { status: true },
  });
  if (!vendor) throw new VendorNotFoundError();
  if (vendor.status !== 'ACTIVE') throw new VendorNotActiveError(vendor.status);
}

interface CreateServiceInput {
  name: string;
  shortDescription?: string;
  description: string;
  category?: string;
  price: number;
  pricingType?: string;
}

interface UpdateServiceInput {
  name?: string;
  shortDescription?: string;
  description?: string;
  category?: string;
  price?: number;
  pricingType?: string;
}

export async function getVendorServices(vendorId: string) {
  const services = await prisma.service.findMany({
    where: { vendorId, isArchived: false },
    orderBy: { createdAt: 'desc' },
  });

  return services.map((s) => ({
    ...s,
    price: Number(s.price),
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  }));
}

export async function getVendorServiceById(serviceId: string, vendorId: string) {
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) throw new ServiceNotFoundError();
  if (service.vendorId !== vendorId) throw new ServiceOwnershipMismatchError();

  return {
    ...service,
    price: Number(service.price),
    createdAt: service.createdAt.toISOString(),
    updatedAt: service.updatedAt.toISOString(),
  };
}

export async function createVendorService(vendorId: string, input: CreateServiceInput) {
  await ensureVendorActive(vendorId);

  const service = await prisma.service.create({
    data: {
      vendorId,
      name: input.name,
      shortDescription: input.shortDescription || null,
      description: input.description,
      category: (input.category as ServiceCategory) || null,
      price: input.price,
      pricingType: (input.pricingType as PricingType) || 'FIXED',
      isActive: true,
      isArchived: false,
    },
  });

  return {
    ...service,
    price: Number(service.price),
    createdAt: service.createdAt.toISOString(),
    updatedAt: service.updatedAt.toISOString(),
  };
}

export async function updateVendorService(
  serviceId: string,
  vendorId: string,
  input: UpdateServiceInput,
) {
  await ensureVendorActive(vendorId);

  const existing = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!existing) throw new ServiceNotFoundError();
  if (existing.vendorId !== vendorId) throw new ServiceOwnershipMismatchError();

  const data: Record<string, unknown> = {};
  if (input.name !== undefined) data.name = input.name;
  if (input.shortDescription !== undefined) data.shortDescription = input.shortDescription || null;
  if (input.description !== undefined) data.description = input.description;
  if (input.category !== undefined) data.category = (input.category || null) as ServiceCategory;
  if (input.price !== undefined) data.price = input.price;
  if (input.pricingType !== undefined) data.pricingType = (input.pricingType as PricingType) || 'FIXED';

  const service = await prisma.service.update({
    where: { id: serviceId },
    data,
  });

  return {
    ...service,
    price: Number(service.price),
    createdAt: service.createdAt.toISOString(),
    updatedAt: service.updatedAt.toISOString(),
  };
}

export async function archiveVendorService(serviceId: string, vendorId: string) {
  const existing = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!existing) throw new ServiceNotFoundError();
  if (existing.vendorId !== vendorId) throw new ServiceOwnershipMismatchError();

  await prisma.service.update({
    where: { id: serviceId },
    data: { isArchived: true },
  });
}

export async function publishVendorService(serviceId: string, vendorId: string) {
  const existing = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!existing) throw new ServiceNotFoundError();
  if (existing.vendorId !== vendorId) throw new ServiceOwnershipMismatchError();

  await prisma.service.update({
    where: { id: serviceId },
    data: { isActive: true },
  });
}

export async function unpublishVendorService(serviceId: string, vendorId: string) {
  const existing = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!existing) throw new ServiceNotFoundError();
  if (existing.vendorId !== vendorId) throw new ServiceOwnershipMismatchError();

  await prisma.service.update({
    where: { id: serviceId },
    data: { isActive: false },
  });
}

export async function rejectVendor(vendorId: string, reason: string, _reviewedBy: string) {
  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    include: { user: { select: { id: true, name: true } } },
  });

  if (!vendor) throw new VendorNotFoundError();
  if (vendor.status !== 'PENDING_REVIEW') throw new VendorNotPendingReviewError(vendor.status);

  await prisma.$transaction(async (tx) => {
    await tx.vendor.update({
      where: { id: vendorId },
      data: { status: 'REJECTED', rejectedReason: reason },
    });

    await tx.notification.create({
      data: {
        userId: vendor.userId,
        type: 'VENDOR_STATUS',
        title: 'Vendor Application Rejected',
        message: `Your vendor application for "${vendor.businessName}" has been rejected. Reason: ${reason}`,
      },
    });
  });
}

// -----------------------------------------------------------------
// PUBLIC MARKETPLACE
// -----------------------------------------------------------------

export interface MarketplaceQuery {
  search?: string;
  category?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export async function listMarketplaceVendors(input: MarketplaceQuery) {
  const { search, category, sort = 'name', page = 1, limit = 20 } = input;

  const where: Prisma.VendorWhereInput = {
    status: 'ACTIVE',
    services: {
      some: { isActive: true, isArchived: false },
    },
  };

  if (search) {
    where.OR = [
      { businessName: { contains: search, mode: 'insensitive' } },
      { services: { some: { name: { contains: search, mode: 'insensitive' } } } },
    ];
  }

  if (category) {
    where.services = {
      some: {
        category: category as ServiceCategory,
        isActive: true,
        isArchived: false,
      },
    };
  }

  let orderBy: Prisma.VendorOrderByWithRelationInput = { businessName: 'asc' };
  if (sort === 'price_asc') orderBy = { businessName: 'asc' };
  if (sort === 'price_desc') orderBy = { businessName: 'desc' };

  const [vendors, total] = await Promise.all([
    prisma.vendor.findMany({
      where,
      include: {
        user: { select: { id: true, name: true } },
        services: {
          where: { isActive: true, isArchived: false },
          orderBy: { name: 'asc' },
        },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.vendor.count({ where }),
  ]);

  return {
    vendors: vendors.map((v) => ({
      ...v,
      createdAt: v.createdAt.toISOString(),
      updatedAt: v.updatedAt.toISOString(),
      approvedAt: v.approvedAt?.toISOString() ?? null,
      activationDate: v.activationDate?.toISOString() ?? null,
      services: v.services.map((s) => ({
        id: s.id,
        name: s.name,
        shortDescription: s.shortDescription,
        description: s.description,
        category: s.category,
        price: s.price.toString(),
        pricingType: s.pricingType,
        imageUrl: s.imageUrl,
        boothLocation: s.boothLocation,
        isActive: s.isActive,
        createdAt: s.createdAt.toISOString(),
        updatedAt: s.updatedAt.toISOString(),
      })),
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getPublicVendorProfile(vendorId: string) {
  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    include: {
      user: { select: { id: true, name: true } },
      services: {
        where: { isActive: true, isArchived: false },
        orderBy: { name: 'asc' },
      },
    },
  });

  if (!vendor || vendor.status !== 'ACTIVE') {
    throw new VendorNotFoundError();
  }

  return {
    ...vendor,
    createdAt: vendor.createdAt.toISOString(),
    updatedAt: vendor.updatedAt.toISOString(),
    approvedAt: vendor.approvedAt?.toISOString() ?? null,
    activationDate: vendor.activationDate?.toISOString() ?? null,
    services: vendor.services.map((s) => ({
      id: s.id,
      name: s.name,
      shortDescription: s.shortDescription,
      description: s.description,
      category: s.category,
      price: s.price.toString(),
      pricingType: s.pricingType,
      imageUrl: s.imageUrl,
      boothLocation: s.boothLocation,
      isActive: s.isActive,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    })),
  };
}

export interface VendorAnalytics {
  vendorStatus: string;
  totalServices: number;
  publishedServices: number;
  draftServices: number;
  totalViews: number;
  mostViewedService: { name: string; views: number } | null;
  categoryBreakdown: Record<string, number>;
  growthByMonth: { month: string; count: number }[];
  services: {
    id: string;
    name: string;
    category: string | null;
    isActive: boolean;
    createdAt: string;
    views: number;
    price: number;
    pricingType: string;
  }[];
}

export async function getVendorAnalytics(userId: string): Promise<VendorAnalytics | null> {
  const vendor = await prisma.vendor.findUnique({
    where: { userId },
    include: {
      services: {
        where: { isArchived: false },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!vendor) return null;
  if (vendor.status !== 'ACTIVE') {
    return {
      vendorStatus: vendor.status,
      totalServices: 0,
      publishedServices: 0,
      draftServices: 0,
      totalViews: 0,
      mostViewedService: null,
      categoryBreakdown: {},
      growthByMonth: [],
      services: [],
    };
  }

  const all = vendor.services;
  const published = all.filter((s) => s.isActive);
  const totalViews = all.reduce((sum, s) => sum + Number(s.viewCount ?? 0), 0);

  const sortedByViews = [...all].sort((a, b) => Number(b.viewCount ?? 0) - Number(a.viewCount ?? 0));
  const mostViewed = sortedByViews[0] ?? null;

  const categoryBreakdown: Record<string, number> = {};
  for (const s of all) {
    const cat = s.category ?? 'OTHER';
    categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;
  }

  const monthlyMap: Record<string, number> = {};
  for (const s of all) {
    const key = `${s.createdAt.getFullYear()}-${String(s.createdAt.getMonth() + 1).padStart(2, '0')}`;
    monthlyMap[key] = (monthlyMap[key] || 0) + 1;
  }
  const growthByMonth = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month, count }));

  return {
    vendorStatus: vendor.status,
    totalServices: all.length,
    publishedServices: published.length,
    draftServices: all.length - published.length,
    totalViews,
    mostViewedService: mostViewed ? { name: mostViewed.name, views: Number(mostViewed.viewCount ?? 0) } : null,
    categoryBreakdown,
    growthByMonth,
    services: all.map((s) => ({
      id: s.id,
      name: s.name,
      category: s.category,
      isActive: s.isActive,
      createdAt: s.createdAt.toISOString(),
      views: Number(s.viewCount ?? 0),
      price: Number(s.price),
      pricingType: s.pricingType,
    })),
  };
}

export async function getPublicServiceById(serviceId: string) {
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: {
      vendor: {
        include: {
          user: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!service || !service.isActive || service.isArchived || service.vendor.status !== 'ACTIVE') {
    throw new ServiceNotFoundError();
  }

  return {
    ...service,
    price: service.price.toString(),
    createdAt: service.createdAt.toISOString(),
    updatedAt: service.updatedAt.toISOString(),
    vendor: {
      id: service.vendor.id,
      businessName: service.vendor.businessName,
      description: service.vendor.description,
      status: service.vendor.status,
      createdAt: service.vendor.createdAt.toISOString(),
      updatedAt: service.vendor.updatedAt.toISOString(),
      approvedAt: service.vendor.approvedAt?.toISOString() ?? null,
      activationDate: service.vendor.activationDate?.toISOString() ?? null,
      user: service.vendor.user,
    },
  };
}
