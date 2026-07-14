import { prisma } from '@/lib/prisma';
import { ReportFilterData } from '@/validators/report.validator';
import { Prisma } from '@/generated/prisma/client';

// ── Shared Types ─────────────────────────────────────────────

export interface ReportStats {
  total: number;
  filtered: number;
  generatedAt: string;
}

// ── Events Report ────────────────────────────────────────────

export interface EventReportRow {
  id: string;
  title: string;
  status: string;
  capacity: number;
  ticketsSold: number;
  remaining: number;
  location: string;
  startDate: string;
  createdAt: string;
}

export async function getEventsReport(filters: ReportFilterData) {
  const where: Prisma.EventWhereInput = {};

  if (filters.query) {
    where.OR = [
      { title: { contains: filters.query, mode: 'insensitive' } },
      { location: { contains: filters.query, mode: 'insensitive' } },
    ];
  }

  if (filters.status && filters.status !== 'ALL') {
    where.status = filters.status as Prisma.EnumEventStatusFilter['equals'];
  }

  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {};
    if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
    if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo + 'T23:59:59.999Z');
  }

  const skip = (filters.page - 1) * filters.limit;

  const [rows, total, filtered] = await Promise.all([
    prisma.event.findMany({
      where,
      select: {
        id: true,
        title: true,
        status: true,
        capacity: true,
        ticketsSold: true,
        location: true,
        startDate: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: filters.limit,
    }),
    prisma.event.count(),
    prisma.event.count({ where }),
  ]);

  const mapped: EventReportRow[] = rows.map((r) => ({
    id: r.id,
    title: r.title,
    status: r.status,
    capacity: r.capacity,
    ticketsSold: r.ticketsSold,
    remaining: r.capacity - r.ticketsSold,
    location: r.location,
    startDate: r.startDate.toISOString(),
    createdAt: r.createdAt.toISOString(),
  }));

  return {
    rows: mapped,
    total,
    filtered,
    page: filters.page,
    totalPages: Math.ceil(filtered / filters.limit),
    stats: { total, filtered, generatedAt: new Date().toISOString() } as ReportStats,
  };
}

// ── Bookings Report ──────────────────────────────────────────

export interface BookingReportRow {
  id: string;
  bookingRef: string;
  customerName: string;
  customerEmail: string;
  eventTitle: string;
  ticketCount: number;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export async function getBookingsReport(filters: ReportFilterData) {
  const where: Prisma.BookingWhereInput = {};

  if (filters.query) {
    where.OR = [
      { ticketCode: { contains: filters.query, mode: 'insensitive' } },
      { user: { name: { contains: filters.query, mode: 'insensitive' } } },
      { user: { email: { contains: filters.query, mode: 'insensitive' } } },
    ];
  }

  if (filters.status && filters.status !== 'ALL') {
    where.status = filters.status as Prisma.EnumBookingStatusFilter['equals'];
  }

  if (filters.eventId) {
    where.eventId = filters.eventId;
  }

  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {};
    if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
    if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo + 'T23:59:59.999Z');
  }

  const skip = (filters.page - 1) * filters.limit;

  const [rows, total, filtered] = await Promise.all([
    prisma.booking.findMany({
      where,
      select: {
        id: true,
        ticketCode: true,
        totalAmount: true,
        status: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
        event: { select: { title: true } },
        items: { select: { quantity: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: filters.limit,
    }),
    prisma.booking.count(),
    prisma.booking.count({ where }),
  ]);

  const mapped: BookingReportRow[] = rows.map((r) => ({
    id: r.id,
    bookingRef: r.ticketCode,
    customerName: r.user.name,
    customerEmail: r.user.email,
    eventTitle: r.event?.title || 'N/A',
    ticketCount: r.items.reduce((sum, item) => sum + item.quantity, 0),
    totalAmount: Number(r.totalAmount),
    status: r.status,
    createdAt: r.createdAt.toISOString(),
  }));

  return {
    rows: mapped,
    total,
    filtered,
    page: filters.page,
    totalPages: Math.ceil(filtered / filters.limit),
    stats: { total, filtered, generatedAt: new Date().toISOString() } as ReportStats,
  };
}

// ── Users Report ─────────────────────────────────────────────

export interface UserReportRow {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  bookingCount: number;
  reviewCount: number;
  createdAt: string;
}

export async function getUsersReport(filters: ReportFilterData) {
  const where: Prisma.UserWhereInput = {};

  if (filters.query) {
    where.OR = [
      { name: { contains: filters.query, mode: 'insensitive' } },
      { email: { contains: filters.query, mode: 'insensitive' } },
    ];
  }

  if (filters.role && filters.role !== 'ALL') {
    where.role = filters.role as Prisma.EnumUserRoleFilter['equals'];
  }

  if (filters.status === 'active') {
    where.isActive = true;
  } else if (filters.status === 'inactive') {
    where.isActive = false;
  }

  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {};
    if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
    if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo + 'T23:59:59.999Z');
  }

  const skip = (filters.page - 1) * filters.limit;

  const [rows, total, filtered] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: { select: { bookings: true, reviews: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: filters.limit,
    }),
    prisma.user.count(),
    prisma.user.count({ where }),
  ]);

  const mapped: UserReportRow[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    role: r.role,
    isActive: r.isActive,
    bookingCount: r._count.bookings,
    reviewCount: r._count.reviews,
    createdAt: r.createdAt.toISOString(),
  }));

  return {
    rows: mapped,
    total,
    filtered,
    page: filters.page,
    totalPages: Math.ceil(filtered / filters.limit),
    stats: { total, filtered, generatedAt: new Date().toISOString() } as ReportStats,
  };
}

// ── Vendors Report ───────────────────────────────────────────

export interface VendorReportRow {
  id: string;
  businessName: string;
  ownerName: string;
  ownerEmail: string;
  status: string;
  serviceCount: number;
  bookingCount: number;
  createdAt: string;
}

export async function getVendorsReport(filters: ReportFilterData) {
  const where: Prisma.VendorWhereInput = {};

  if (filters.query) {
    where.OR = [
      { businessName: { contains: filters.query, mode: 'insensitive' } },
      { user: { name: { contains: filters.query, mode: 'insensitive' } } },
      { user: { email: { contains: filters.query, mode: 'insensitive' } } },
    ];
  }

  if (filters.status && filters.status !== 'ALL') {
    where.status = filters.status as Prisma.EnumVendorStatusFilter['equals'];
  }

  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {};
    if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
    if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo + 'T23:59:59.999Z');
  }

  const skip = (filters.page - 1) * filters.limit;

  const [rows, total, filtered] = await Promise.all([
    prisma.vendor.findMany({
      where,
      select: {
        id: true,
        businessName: true,
        status: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
        _count: { select: { services: true, bookings: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: filters.limit,
    }),
    prisma.vendor.count(),
    prisma.vendor.count({ where }),
  ]);

  const mapped: VendorReportRow[] = rows.map((r) => ({
    id: r.id,
    businessName: r.businessName,
    ownerName: r.user.name,
    ownerEmail: r.user.email,
    status: r.status,
    serviceCount: r._count.services,
    bookingCount: r._count.bookings,
    createdAt: r.createdAt.toISOString(),
  }));

  return {
    rows: mapped,
    total,
    filtered,
    page: filters.page,
    totalPages: Math.ceil(filtered / filters.limit),
    stats: { total, filtered, generatedAt: new Date().toISOString() } as ReportStats,
  };
}

// ── Reviews Report ───────────────────────────────────────────

export interface ReviewReportRow {
  id: string;
  eventTitle: string;
  reviewerName: string;
  reviewerEmail: string;
  rating: number;
  comment: string;
  status: string;
  createdAt: string;
}

export async function getReviewsReport(filters: ReportFilterData) {
  const where: Prisma.ReviewWhereInput = {};

  if (filters.query) {
    where.OR = [
      { user: { name: { contains: filters.query, mode: 'insensitive' } } },
      { user: { email: { contains: filters.query, mode: 'insensitive' } } },
      { event: { title: { contains: filters.query, mode: 'insensitive' } } },
    ];
  }

  if (filters.status && filters.status !== 'ALL') {
    where.status = filters.status as Prisma.EnumReviewStatusFilter['equals'];
  }

  if (filters.eventId) {
    where.eventId = filters.eventId;
  }

  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {};
    if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
    if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo + 'T23:59:59.999Z');
  }

  const skip = (filters.page - 1) * filters.limit;

  const [rows, total, filtered] = await Promise.all([
    prisma.review.findMany({
      where,
      select: {
        id: true,
        rating: true,
        comment: true,
        status: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
        event: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: filters.limit,
    }),
    prisma.review.count(),
    prisma.review.count({ where }),
  ]);

  const mapped: ReviewReportRow[] = rows.map((r) => ({
    id: r.id,
    eventTitle: r.event.title,
    reviewerName: r.user.name,
    reviewerEmail: r.user.email,
    rating: r.rating,
    comment: r.comment || '',
    status: r.status,
    createdAt: r.createdAt.toISOString(),
  }));

  return {
    rows: mapped,
    total,
    filtered,
    page: filters.page,
    totalPages: Math.ceil(filtered / filters.limit),
    stats: { total, filtered, generatedAt: new Date().toISOString() } as ReportStats,
  };
}

// ── Export Helpers ───────────────────────────────────────────

function escapeCsvField(value: unknown): string {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function generateCsv(headers: string[], rows: unknown[][]): string {
  const header = headers.map(escapeCsvField).join(',');
  const body = rows.map((row) => row.map(escapeCsvField).join(',')).join('\n');
  return header + '\n' + body;
}

export async function getReportDataForExport(filters: ReportFilterData) {
  const unlimitedFilters = { ...filters, page: 1, limit: 100000 };

  switch (filters.type) {
    case 'events': {
      const result = await getEventsReport(unlimitedFilters);
      return {
        headers: ['Event Name', 'Status', 'Capacity', 'Tickets Sold', 'Remaining', 'Location', 'Start Date', 'Created'],
        rows: result.rows.map((r) => [r.title, r.status, r.capacity, r.ticketsSold, r.remaining, r.location, r.startDate, r.createdAt]),
        total: result.filtered,
      };
    }
    case 'bookings': {
      const result = await getBookingsReport(unlimitedFilters);
      return {
        headers: ['Booking Ref', 'Customer', 'Email', 'Event', 'Tickets', 'Amount (KES)', 'Status', 'Date'],
        rows: result.rows.map((r) => [r.bookingRef, r.customerName, r.customerEmail, r.eventTitle, r.ticketCount, r.totalAmount, r.status, r.createdAt]),
        total: result.filtered,
      };
    }
    case 'users': {
      const result = await getUsersReport(unlimitedFilters);
      return {
        headers: ['Name', 'Email', 'Role', 'Status', 'Bookings', 'Reviews', 'Registered'],
        rows: result.rows.map((r) => [r.name, r.email, r.role, r.isActive ? 'Active' : 'Suspended', r.bookingCount, r.reviewCount, r.createdAt]),
        total: result.filtered,
      };
    }
    case 'vendors': {
      const result = await getVendorsReport(unlimitedFilters);
      return {
        headers: ['Business Name', 'Owner', 'Email', 'Status', 'Services', 'Bookings', 'Registered'],
        rows: result.rows.map((r) => [r.businessName, r.ownerName, r.ownerEmail, r.status, r.serviceCount, r.bookingCount, r.createdAt]),
        total: result.filtered,
      };
    }
    case 'reviews': {
      const result = await getReviewsReport(unlimitedFilters);
      return {
        headers: ['Event', 'Reviewer', 'Email', 'Rating', 'Comment', 'Status', 'Date'],
        rows: result.rows.map((r) => [r.eventTitle, r.reviewerName, r.reviewerEmail, r.rating, r.comment, r.status, r.createdAt]),
        total: result.filtered,
      };
    }
  }
}
