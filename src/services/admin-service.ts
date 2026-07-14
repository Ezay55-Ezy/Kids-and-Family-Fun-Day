import { prisma } from '@/lib/prisma';
import { formatRelativeTime } from '@/lib/format';

interface RawActivity {
  id: string;
  type: 'created' | 'completed' | 'booked' | 'payment';
  title: string;
  description: string;
  date: Date;
}

export interface AdminDashboardStats {
  activeEvents: number;
  draftEvents: number;
  cancelledEvents: number;
  totalBookings: number;
  todayBookings: number;
  totalTicketsIssued: number;
  ticketsCheckedInToday: number;
  totalUsers: number;
  newUsersToday: number;
  activeVendors: number;
  pendingVendors: number;
  awaitingPaymentVendors: number;
  totalReviews: number;
}

export interface AdminActivityItem {
  id: string;
  type: 'created' | 'completed' | 'booked' | 'payment';
  title: string;
  description: string;
  timestamp: string;
}

export interface AdminChartData {
  eventsByStatus: { status: string; count: number }[];
  bookingsThisWeek: { day: string; count: number }[];
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

function getDayLabel(date: Date): string {
  return date.toLocaleDateString('en-KE', { weekday: 'short' });
}

export async function getAdminDashboard(): Promise<{
  stats: AdminDashboardStats;
  recentActivity: AdminActivityItem[];
  charts: AdminChartData;
}> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  const weekStart = getWeekStart();

  const [
    activeEvents,
    draftEvents,
    cancelledEvents,
    totalBookings,
    todayBookings,
    ticketsAgg,
    checkedInToday,
    totalUsers,
    newUsersToday,
    activeVendors,
    pendingVendors,
    awaitingPaymentVendors,
    totalReviews,
    eventsByStatus,
    bookingsThisWeek,
  ] = await Promise.all([
    prisma.event.count({ where: { status: 'PUBLISHED' } }),
    prisma.event.count({ where: { status: 'DRAFT' } }),
    prisma.event.count({ where: { status: 'CANCELLED' } }),
    prisma.booking.count(),
    prisma.booking.count({
      where: { createdAt: { gte: todayStart, lte: todayEnd } },
    }),
    prisma.bookingItem.aggregate({
      where: { booking: { status: 'CONFIRMED' } },
      _sum: { quantity: true },
    }),
    prisma.booking.count({
      where: { checkedInAt: { gte: todayStart, lte: todayEnd } },
    }),
    prisma.user.count(),
    prisma.user.count({
      where: { createdAt: { gte: todayStart, lte: todayEnd } },
    }),
    prisma.vendor.count({ where: { status: 'ACTIVE' } }),
    prisma.vendor.count({ where: { status: 'PENDING_REVIEW' } }),
    prisma.vendor.count({ where: { status: 'APPROVED_AWAITING_PAYMENT' } }),
    prisma.review.count(),
    prisma.event.groupBy({
      by: ['status'],
      _count: { id: true },
    }),
    prisma.booking.groupBy({
      by: ['createdAt'],
      where: { createdAt: { gte: weekStart } },
      _count: { id: true },
    }),
  ]);

  const recentActivity = await getRecentPlatformActivity(5);

  const eventsByStatusData = eventsByStatus.map((e) => ({
    status: e.status,
    count: e._count.id,
  }));

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const bookingsMap: Record<string, number> = {};
  for (const b of bookingsThisWeek) {
    const label = getDayLabel(b.createdAt);
    bookingsMap[label] = (bookingsMap[label] || 0) + b._count.id;
  }
  const bookingsThisWeekData = dayLabels.map((day) => ({
    day,
    count: bookingsMap[day] || 0,
  }));

  return {
    stats: {
      activeEvents,
      draftEvents,
      cancelledEvents,
      totalBookings,
      todayBookings,
      totalTicketsIssued: ticketsAgg._sum.quantity ?? 0,
      ticketsCheckedInToday: checkedInToday,
      totalUsers,
      newUsersToday,
      activeVendors,
      pendingVendors,
      awaitingPaymentVendors,
      totalReviews,
    },
    recentActivity,
    charts: {
      eventsByStatus: eventsByStatusData,
      bookingsThisWeek: bookingsThisWeekData,
    },
  };
}

async function getRecentPlatformActivity(limit = 5): Promise<AdminActivityItem[]> {
  const [recentEvents, recentVendors, recentReviews, recentBookings] = await Promise.all([
    prisma.event.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
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
      take: limit,
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
      take: limit,
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
      take: limit,
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

  const raw: RawActivity[] = [];

  for (const evt of recentEvents) {
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

  for (const v of recentVendors) {
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

  for (const r of recentReviews) {
    raw.push({
      id: `review-${r.id}`,
      type: 'payment',
      title: `Review submitted for ${r.event?.title || 'an event'}`,
      description: `${'★'.repeat(r.rating)} by ${r.user?.name || 'Anonymous'}`,
      date: r.createdAt,
    });
  }

  for (const b of recentBookings) {
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

  return raw.slice(0, limit).map((item) => ({
    ...item,
    timestamp: formatRelativeTime(item.date),
  }));
}
