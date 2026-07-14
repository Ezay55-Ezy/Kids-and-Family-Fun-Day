import { prisma } from '@/lib/prisma';
import { formatRelativeTime } from '@/lib/format';

export interface PlatformAnalytics {
  events: {
    total: number;
    published: number;
    draft: number;
    cancelled: number;
    soldOut: number;
    completed: number;
  };
  bookings: {
    total: number;
    today: number;
  };
  tickets: {
    issued: number;
    checkedIn: number;
    remaining: number;
  };
  users: {
    total: number;
    newThisWeek: number;
  };
  vendors: {
    total: number;
    pendingReview: number;
    awaitingPayment: number;
    active: number;
    rejected: number;
  };
  reviews: {
    total: number;
    published: number;
    hidden: number;
  };
  bookingsOverTime: { month: string; count: number }[];
  userRegistrationsOverTime: { month: string; count: number }[];
  eventsByStatus: { status: string; count: number }[];
  vendorsByStatus: { status: string; count: number }[];
  reviewsByStatus: { status: string; count: number }[];
  recentActivity: AnalyticsActivityItem[];
}

export interface AnalyticsActivityItem {
  id: string;
  type: 'created' | 'completed' | 'booked' | 'payment';
  title: string;
  description: string;
  timestamp: string;
}

function getWeekStart(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const start = new Date(now);
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);
  return start;
}

function getMonthLabel(date: Date): string {
  return date.toLocaleDateString('en-KE', { year: 'numeric', month: 'short' });
}

function getLast6Months(): { start: Date; label: string }[] {
  const months: { start: Date; label: string }[] = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ start: d, label: getMonthLabel(d) });
  }

  return months;
}

export async function getPlatformAnalytics(): Promise<PlatformAnalytics> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  const weekStart = getWeekStart();
  const last6Months = getLast6Months();
  const oldestMonth = last6Months[0].start;

  const [
    totalEvents,
    publishedEvents,
    draftEvents,
    cancelledEvents,
    soldOutEvents,
    completedEvents,
    totalBookings,
    todayBookings,
    ticketsAgg,
    checkedInTickets,
    remainingTicketsAgg,
    totalUsers,
    newUsersThisWeek,
    totalVendors,
    pendingReviewVendors,
    awaitingPaymentVendors,
    activeVendors,
    rejectedVendors,
    totalReviews,
    publishedReviews,
    hiddenReviews,
    bookingsByMonth,
    usersByMonth,
    eventsByStatus,
    vendorsByStatus,
    reviewsByStatus,
    recentEvents,
    recentVendors,
    recentReviews,
    recentBookings,
  ] = await Promise.all([
    prisma.event.count(),
    prisma.event.count({ where: { status: 'PUBLISHED' } }),
    prisma.event.count({ where: { status: 'DRAFT' } }),
    prisma.event.count({ where: { status: 'CANCELLED' } }),
    prisma.event.count({ where: { status: 'SOLD_OUT' } }),
    prisma.event.count({ where: { status: 'COMPLETED' } }),
    prisma.booking.count(),
    prisma.booking.count({
      where: { createdAt: { gte: todayStart, lte: todayEnd } },
    }),
    prisma.bookingItem.aggregate({
      where: { booking: { status: 'CONFIRMED' } },
      _sum: { quantity: true },
    }),
    prisma.ticket.count({ where: { status: 'USED' } }),
    prisma.ticketType.aggregate({
      _sum: { capacity: true, ticketsSold: true },
    }),
    prisma.user.count(),
    prisma.user.count({
      where: { createdAt: { gte: weekStart } },
    }),
    prisma.vendor.count(),
    prisma.vendor.count({ where: { status: 'PENDING_REVIEW' } }),
    prisma.vendor.count({ where: { status: 'APPROVED_AWAITING_PAYMENT' } }),
    prisma.vendor.count({ where: { status: 'ACTIVE' } }),
    prisma.vendor.count({ where: { status: 'REJECTED' } }),
    prisma.review.count(),
    prisma.review.count({ where: { status: 'PUBLISHED' } }),
    prisma.review.count({ where: { status: 'HIDDEN' } }),

    prisma.booking.groupBy({
      by: ['createdAt'],
      where: { createdAt: { gte: oldestMonth } },
      _count: { id: true },
    }),
    prisma.user.groupBy({
      by: ['createdAt'],
      where: { createdAt: { gte: oldestMonth } },
      _count: { id: true },
    }),
    prisma.event.groupBy({
      by: ['status'],
      _count: { id: true },
    }),
    prisma.vendor.groupBy({
      by: ['status'],
      _count: { id: true },
    }),
    prisma.review.groupBy({
      by: ['status'],
      _count: { id: true },
    }),

    prisma.event.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        createdBy: { select: { name: true } },
      },
    }),
    prisma.vendor.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 10,
      select: {
        id: true,
        businessName: true,
        status: true,
        approvedAt: true,
        activationDate: true,
        user: { select: { name: true } },
      },
    }),
    prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        rating: true,
        createdAt: true,
        event: { select: { title: true } },
        user: { select: { name: true } },
      },
    }),
    prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        status: true,
        totalAmount: true,
        createdAt: true,
        user: { select: { name: true } },
        event: { select: { title: true } },
      },
    }),
  ]);

  const totalCapacity = Number(remainingTicketsAgg._sum.capacity ?? 0);
  const totalSold = Number(remainingTicketsAgg._sum.ticketsSold ?? 0);

  const bookingsMap: Record<string, number> = {};
  for (const b of bookingsByMonth) {
    const key = getMonthLabel(b.createdAt);
    bookingsMap[key] = (bookingsMap[key] || 0) + b._count.id;
  }

  const usersMap: Record<string, number> = {};
  for (const u of usersByMonth) {
    const key = getMonthLabel(u.createdAt);
    usersMap[key] = (usersMap[key] || 0) + u._count.id;
  }

  const bookingsOverTime = last6Months.map((m) => ({
    month: m.label,
    count: bookingsMap[m.label] || 0,
  }));

  const userRegistrationsOverTime = last6Months.map((m) => ({
    month: m.label,
    count: usersMap[m.label] || 0,
  }));

  const eventsByStatusData = eventsByStatus.map((e) => ({
    status: e.status,
    count: e._count.id,
  }));

  const vendorsByStatusData = vendorsByStatus.map((v) => ({
    status: v.status,
    count: v._count.id,
  }));

  const reviewsByStatusData = reviewsByStatus.map((r) => ({
    status: r.status,
    count: r._count.id,
  }));

  const recentActivity = buildRecentActivity(
    recentEvents,
    recentVendors,
    recentReviews,
    recentBookings,
  );

  return {
    events: {
      total: totalEvents,
      published: publishedEvents,
      draft: draftEvents,
      cancelled: cancelledEvents,
      soldOut: soldOutEvents,
      completed: completedEvents,
    },
    bookings: {
      total: totalBookings,
      today: todayBookings,
    },
    tickets: {
      issued: ticketsAgg._sum.quantity ?? 0,
      checkedIn: checkedInTickets,
      remaining: totalCapacity - totalSold,
    },
    users: {
      total: totalUsers,
      newThisWeek: newUsersThisWeek,
    },
    vendors: {
      total: totalVendors,
      pendingReview: pendingReviewVendors,
      awaitingPayment: awaitingPaymentVendors,
      active: activeVendors,
      rejected: rejectedVendors,
    },
    reviews: {
      total: totalReviews,
      published: publishedReviews,
      hidden: hiddenReviews,
    },
    bookingsOverTime,
    userRegistrationsOverTime,
    eventsByStatus: eventsByStatusData,
    vendorsByStatus: vendorsByStatusData,
    reviewsByStatus: reviewsByStatusData,
    recentActivity,
  };
}

function buildRecentActivity(
  events: {
    id: string;
    title: string;
    status: string;
    createdAt: Date;
    createdBy: { name: string | null } | null;
  }[],
  vendors: {
    id: string;
    businessName: string;
    status: string;
    approvedAt: Date | null;
    activationDate: Date | null;
    user: { name: string | null } | null;
  }[],
  reviews: {
    id: string;
    rating: number;
    createdAt: Date;
    event: { title: string } | null;
    user: { name: string | null } | null;
  }[],
  bookings: {
    id: string;
    status: string;
    totalAmount: import('@/generated/prisma/client').Prisma.Decimal;
    createdAt: Date;
    user: { name: string | null } | null;
    event: { title: string } | null;
  }[],
): AnalyticsActivityItem[] {
  interface RawActivity {
    id: string;
    type: 'created' | 'completed' | 'booked' | 'payment';
    title: string;
    description: string;
    date: Date;
  }

  const raw: RawActivity[] = [];

  for (const evt of events) {
    const author = evt.createdBy?.name || 'An admin';
    raw.push({
      id: `evt-created-${evt.id}`,
      type: 'created',
      title: `Event created: ${evt.title}`,
      description: `by ${author}`,
      date: evt.createdAt,
    });
    if (evt.status === 'PUBLISHED') {
      raw.push({
        id: `evt-published-${evt.id}`,
        type: 'completed',
        title: `Event published: ${evt.title}`,
        description: `by ${author}`,
        date: evt.createdAt,
      });
    }
  }

  for (const v of vendors) {
    if (v.approvedAt) {
      raw.push({
        id: `v-approved-${v.id}`,
        type: 'completed',
        title: `Vendor approved: ${v.businessName}`,
        description: v.user?.name || 'Unknown',
        date: v.approvedAt,
      });
    }
    if (v.activationDate) {
      raw.push({
        id: `v-activated-${v.id}`,
        type: 'completed',
        title: `Vendor activated: ${v.businessName}`,
        description: v.user?.name || 'Unknown',
        date: v.activationDate,
      });
    }
  }

  for (const r of reviews) {
    raw.push({
      id: `review-${r.id}`,
      type: 'payment',
      title: `Review submitted for ${r.event?.title || 'an event'}`,
      description: `${'★'.repeat(r.rating)} by ${r.user?.name || 'Anonymous'}`,
      date: r.createdAt,
    });
  }

  for (const b of bookings) {
    const userName = b.user?.name || 'Someone';
    const eventTitle = b.event?.title || 'an event';
    const amount = Number(b.totalAmount).toLocaleString();
    raw.push({
      id: `booking-${b.id}`,
      type: 'booked',
      title: `${userName} booked ${eventTitle}`,
      description: `KSh ${amount} — ${b.status}`,
      date: b.createdAt,
    });
  }

  raw.sort((a, b) => b.date.getTime() - a.date.getTime());

  return raw.slice(0, 15).map((item) => ({
    ...item,
    timestamp: formatRelativeTime(item.date),
  }));
}
