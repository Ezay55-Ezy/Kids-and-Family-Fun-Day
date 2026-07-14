import { prisma } from '@/lib/prisma';

export interface DashboardStats {
  totalBookings: number;
  activeTickets: number;
  upcomingEvents: number;
  unreadNotifications: number;
}

export interface DashboardUpcomingEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  status: 'published' | 'sold_out' | 'draft';
}

export interface DashboardActivity {
  id: string;
  type: 'created' | 'completed' | 'login' | 'booked' | 'payment';
  title: string;
  description: string;
  timestamp: string;
}

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const now = new Date();

  const [
    totalBookings,
    activeTicketsAgg,
    upcomingEvents,
    unreadNotifications,
  ] = await Promise.all([
    prisma.booking.count({ where: { userId } }),
    prisma.bookingItem.aggregate({
      where: { booking: { userId, status: 'CONFIRMED' } },
      _sum: { quantity: true },
    }),
    prisma.event.count({
      where: {
        status: 'PUBLISHED',
        startDate: { gte: now },
      },
    }),
    prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    }),
  ]);

  return {
    totalBookings,
    activeTickets: activeTicketsAgg._sum.quantity ?? 0,
    upcomingEvents,
    unreadNotifications,
  };
}

export async function getDashboardUpcomingEvents(limit = 5): Promise<DashboardUpcomingEvent[]> {
  const now = new Date();

  const events = await prisma.event.findMany({
    where: {
      status: 'PUBLISHED',
      startDate: { gte: now },
    },
    orderBy: { startDate: 'asc' },
    take: limit,
    select: {
      id: true,
      title: true,
      startDate: true,
      endDate: true,
      location: true,
      status: true,
    },
  });

  return events.map((e) => ({
    id: e.id,
    title: e.title,
    date: new Intl.DateTimeFormat('en-KE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(e.startDate),
    time: new Intl.DateTimeFormat('en-KE', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(e.startDate),
    location: e.location,
    status: e.status === 'PUBLISHED'
      ? 'published' as const
      : e.status === 'SOLD_OUT'
        ? 'sold_out' as const
        : 'draft' as const,
  }));
}

export async function getDashboardRecentActivity(limit = 5): Promise<DashboardActivity[]> {
  const events = await prisma.event.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      title: true,
      status: true,
      createdAt: true,
      createdBy: {
        select: { name: true },
      },
    },
  });

  return events.map((e) => {
    const now = new Date();
    const diffMs = now.getTime() - e.createdAt.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    let timestamp: string;
    if (diffMins < 1) timestamp = 'Just now';
    else if (diffMins < 60) timestamp = `${diffMins}m ago`;
    else if (diffHours < 24) timestamp = `${diffHours}h ago`;
    else timestamp = new Intl.DateTimeFormat('en-KE', { day: 'numeric', month: 'short' }).format(e.createdAt);

    return {
      id: e.id,
      type: e.status === 'PUBLISHED' ? 'completed' as const : 'created' as const,
      title: e.status === 'PUBLISHED'
        ? `Event published: ${e.title}`
        : `Event created: ${e.title}`,
      description: e.createdBy?.name
        ? `by ${e.createdBy.name}`
        : '',
      timestamp,
    };
  });
}

// -----------------------------------------------------------------
// My Bookings (transaction view)
// -----------------------------------------------------------------

export interface UserBooking {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  ticketCode: string;
  canCancel: boolean;
  event: {
    title: string;
    slug: string;
    startDate: string;
    location: string;
  } | null;
  items: Array<{
    id: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    ticketTypeName: string;
  }>;
}

export async function getUserBookings(userId: string): Promise<UserBooking[]> {
  const bookings = await prisma.booking.findMany({
    where: { userId },
    include: {
      event: {
        select: { title: true, slug: true, startDate: true, location: true },
      },
      items: {
        include: { ticketType: { select: { name: true } } },
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const now = new Date();

  return bookings.map((b) => ({
    id: b.id,
    status: b.status,
    totalAmount: Number(b.totalAmount.toString()),
    createdAt: b.createdAt.toISOString(),
    ticketCode: b.ticketCode,
    canCancel: b.status === 'CONFIRMED' && (b.event ? b.event.startDate > now : false),
    event: b.event
      ? {
          title: b.event.title,
          slug: b.event.slug,
          startDate: b.event.startDate.toISOString(),
          location: b.event.location,
        }
      : null,
    items: b.items.map((i) => ({
      id: i.id,
      quantity: i.quantity,
      unitPrice: Number(i.unitPrice.toString()),
      subtotal: Number(i.subtotal.toString()),
      ticketTypeName: i.ticketType.name,
    })),
  }));
}

// -----------------------------------------------------------------
// My Tickets (line-item view)
// -----------------------------------------------------------------

export interface UserTicket {
  id: string;
  bookingId: string;
  eventTitle: string;
  eventSlug: string;
  eventDate: string;
  eventLocation: string;
  ticketTypeName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  bookingStatus: string;
}

export async function getUserTickets(userId: string): Promise<UserTicket[]> {
  const bookings = await prisma.booking.findMany({
    where: { userId },
    include: {
      event: {
        select: { title: true, slug: true, startDate: true, location: true },
      },
      items: {
        include: { ticketType: { select: { name: true } } },
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const tickets: UserTicket[] = [];

  for (const b of bookings) {
    for (const i of b.items) {
      tickets.push({
        id: i.id,
        bookingId: b.id,
        eventTitle: b.event?.title ?? '(Unknown event)',
        eventSlug: b.event?.slug ?? '#',
        eventDate: b.event?.startDate.toISOString() ?? '',
        eventLocation: b.event?.location ?? '',
        ticketTypeName: i.ticketType.name,
        quantity: i.quantity,
        unitPrice: Number(i.unitPrice.toString()),
        subtotal: Number(i.subtotal.toString()),
        bookingStatus: b.status,
      });
    }
  }

  return tickets;
}

// -----------------------------------------------------------------
// Ticket Wallet — active tickets only (for "show at the door")
// -----------------------------------------------------------------

export interface WalletTicket {
  id: string;
  ticketCode: string;
  checkinUrl: string;
  status: string;
  event: {
    title: string;
    slug: string;
    startDate: string;
    endDate: string;
    location: string;
  };
  items: Array<{
    ticketTypeName: string;
    quantity: number;
  }>;
}

export async function getUserWallet(userId: string): Promise<WalletTicket[]> {
  const bookings = await prisma.booking.findMany({
    where: { userId, status: 'CONFIRMED' },
    include: {
      event: {
        select: { title: true, slug: true, startDate: true, endDate: true, location: true },
      },
      items: {
        include: { ticketType: { select: { name: true } } },
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const baseUrl = process.env.NEXT_PUBLIC_CHECKIN_BASE_URL ?? process.env.AUTH_URL ?? 'http://localhost:3000';

  return bookings.map((b) => ({
    id: b.id,
    ticketCode: b.ticketCode,
    checkinUrl: `${baseUrl}/checkin/${b.ticketCode}`,
    status: b.status,
    event: {
      title: b.event?.title ?? '(Unknown event)',
      slug: b.event?.slug ?? '#',
      startDate: b.event?.startDate.toISOString() ?? '',
      endDate: b.event?.endDate.toISOString() ?? '',
      location: b.event?.location ?? '',
    },
    items: b.items.map((i) => ({
      ticketTypeName: i.ticketType.name,
      quantity: i.quantity,
    })),
  }));
}
