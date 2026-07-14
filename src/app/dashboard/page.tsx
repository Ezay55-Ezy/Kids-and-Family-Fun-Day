import Link from 'next/link';
import { auth } from '@/auth';
import StatCard from '@/components/dashboard/StatCard';
import RecentActivity from '@/components/dashboard/RecentActivity';
import UpcomingEvents from '@/components/dashboard/UpcomingEvents';
import {
  getDashboardStats,
  getDashboardUpcomingEvents,
  getDashboardRecentActivity,
} from '@/services/dashboard-service';

export const metadata = {
  title: 'Dashboard',
  description: 'Your Kids & Family Fun Day Kenya dashboard',
};

export default async function DashboardPage() {
  const session = await auth();
  const user = session?.user;
  const firstName = user?.name?.split(' ')[0] || 'there';

  const [stats, events, activities] = await Promise.all([
    getDashboardStats(user?.id ?? ''),
    getDashboardUpcomingEvents(),
    getDashboardRecentActivity(),
  ]);

  return (
    <div className="max-w-6xl space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink">
          Welcome back, {firstName}
        </h2>
        <p className="text-ink/60 mt-1">
          Here&apos;s what&apos;s happening with your account.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Bookings"
          value={stats.totalBookings}
          color="coral"
          icon={
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          }
        />
        <StatCard
          label="Active Tickets"
          value={stats.activeTickets}
          color="sky"
          icon={
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
              <path d="M9 9h.01" />
            </svg>
          }
        />
        <StatCard
          label="Upcoming Events"
          value={stats.upcomingEvents}
          color="grass"
          icon={
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          }
        />
        <StatCard
          label="Notifications"
          value={stats.unreadNotifications}
          color="sun"
          icon={
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          }
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/events" className="btn-primary text-sm">
          Browse Events
        </Link>
        <Link href="/vendors" className="btn-secondary text-sm">
          Find Vendors
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentActivity items={activities} />
        <UpcomingEvents events={events} />
      </div>
    </div>
  );
}
