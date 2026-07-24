import Link from 'next/link';
import { auth } from '@/auth';
import { getAdminDashboard } from '@/services/admin-service';
import BarChart from '@/components/charts/BarChart';
import DonutChart from '@/components/charts/DonutChart';
import RecentActivity from '@/components/dashboard/RecentActivity';

export const metadata = {
  title: 'Admin Dashboard',
  description: 'Kids & Family Fun Day Kenya administration',
};

const statusColors: Record<string, string> = {
  PUBLISHED: '#22884E',
  DRAFT: '#C49A2A',
  CANCELLED: '#B84545',
  SOLD_OUT: '#7B6AAF',
  COMPLETED: '#C49A2A',
};

const statusLabels: Record<string, string> = {
  PUBLISHED: 'Published',
  DRAFT: 'Draft',
  CANCELLED: 'Cancelled',
  SOLD_OUT: 'Sold Out',
  COMPLETED: 'Completed',
};

const statusDotColors: Record<string, string> = {
  PUBLISHED: 'bg-grass',
  DRAFT: 'bg-sun',
  CANCELLED: 'bg-coral',
  SOLD_OUT: 'bg-[#8B5CF6]',
  COMPLETED: 'bg-sky',
};

export default async function AdminOverviewPage() {
  const session = await auth();

  let stats, recentActivity, charts;
  try {
    ({ stats, recentActivity, charts } = await getAdminDashboard());
  } catch (err) {
    console.error('[ADMIN_DASHBOARD_ERROR]', err);
    stats = {
      activeEvents: 0,
      draftEvents: 0,
      cancelledEvents: 0,
      totalBookings: 0,
      todayBookings: 0,
      totalTicketsIssued: 0,
      ticketsCheckedInToday: 0,
      totalUsers: 0,
      newUsersToday: 0,
      activeVendors: 0,
      pendingVendors: 0,
      awaitingPaymentVendors: 0,
      totalReviews: 0,
    };
    recentActivity = [];
    charts = { eventsByStatus: [], bookingsThisWeek: [] };
  }

  const eventsByStatusData = charts.eventsByStatus.map((e) => ({
    label: statusLabels[e.status] || e.status,
    value: e.count,
    color: statusColors[e.status] || '#9CA3AF',
  }));

  return (
    <div className="max-w-6xl space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink">
          Admin Overview
        </h2>
        <p className="text-ink/60 mt-1">
          Welcome back, {session?.user?.name?.split(' ')[0] || 'Admin'}
        </p>
      </div>

      {/* Hero 4 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/events" className="contents">
          <div className="rounded-xl bg-paper border border-ink/10 shadow-soft p-5 hover:shadow-soft-lg lg:hover:-translate-y-0.5 transition-shadow">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sky/10 text-sky ring-1 ring-sky/20">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-ink/60">Total Bookings</p>
                <p className="font-display text-2xl font-bold text-ink mt-0.5">{stats.totalBookings}</p>
              </div>
            </div>
            <p className="text-xs text-ink/40 mt-3">{stats.todayBookings} today</p>
          </div>
        </Link>

        <Link href="/admin/users" className="contents">
          <div className="rounded-xl bg-paper border border-ink/10 shadow-soft p-5 hover:shadow-soft-lg lg:hover:-translate-y-0.5 transition-shadow">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-grass/10 text-grass ring-1 ring-grass/20">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-ink/60">Total Users</p>
                <p className="font-display text-2xl font-bold text-ink mt-0.5">{stats.totalUsers}</p>
              </div>
            </div>
            <p className="text-xs text-ink/40 mt-3">{stats.newUsersToday} new today</p>
          </div>
        </Link>

        <Link href="/admin/vendors?status=ACTIVE" className="contents">
          <div className="rounded-xl bg-paper border border-ink/10 shadow-soft p-5 hover:shadow-soft-lg lg:hover:-translate-y-0.5 transition-shadow">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sun/10 text-sun ring-1 ring-sun/20">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-ink/60">Active Vendors</p>
                <p className="font-display text-2xl font-bold text-ink mt-0.5">{stats.activeVendors}</p>
              </div>
            </div>
            <p className="text-xs text-ink/40 mt-3">{stats.pendingVendors} pending review</p>
          </div>
        </Link>

        <Link href="/admin/reports" className="contents">
          <div className="rounded-xl bg-paper border border-ink/10 shadow-soft p-5 hover:shadow-soft-lg lg:hover:-translate-y-0.5 transition-shadow">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-coral/10 text-coral ring-1 ring-coral/20">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                  <path d="M9 9h.01" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-ink/60">Tickets Issued</p>
                <p className="font-display text-2xl font-bold text-ink mt-0.5">{stats.totalTicketsIssued}</p>
              </div>
            </div>
            <p className="text-xs text-ink/40 mt-3">{stats.ticketsCheckedInToday} checked in today</p>
          </div>
        </Link>
      </div>

      {/* Charts + Activity + Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Charts column */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-ink/10 bg-paper p-5 shadow-soft">
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="font-display text-base font-semibold text-ink">Bookings This Week</h2>
              <span className="text-sm text-ink/40">{stats.todayBookings} today</span>
            </div>
            <BarChart
              data={charts.bookingsThisWeek.map((d) => ({
                label: d.day,
                value: d.count,
                color: '#1E8E82',
              }))}
              height={160}
            />
          </div>

          {eventsByStatusData.length > 0 && (
            <div className="rounded-xl border border-ink/10 bg-paper p-5 shadow-soft">
              <h2 className="font-display text-base font-semibold text-ink mb-4">Events by Status</h2>
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-8">
                <div className="shrink-0">
                  <DonutChart data={eventsByStatusData} size={140} />
                </div>
                <div className="space-y-2 flex-1">
                  {eventsByStatusData.map((d) => (
                    <div key={d.label} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full shrink-0 ${statusDotColors[charts.eventsByStatus.find((e) => statusLabels[e.status] === d.label)?.status || ''] || 'bg-ink/20'}`} />
                        <span className="text-ink/60">{d.label}</span>
                      </div>
                      <span className="font-medium text-ink">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Activity + Quick Actions column */}
        <div className="space-y-6">
          <RecentActivity items={recentActivity} />

          <div className="space-y-4">
            <h2 className="font-display font-semibold text-lg text-ink">Quick Actions</h2>
            <Link
              href="/admin/events/new"
              className="flex items-center gap-4 rounded-xl bg-paper border border-ink/10 shadow-soft p-5 hover:shadow-soft-lg lg:hover:-translate-y-0.5 transition-shadow"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-coral/10 text-coral">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </div>
              <div>
                <p className="font-display font-semibold text-ink">Create Event</p>
                <p className="text-sm text-ink/60">Set up a new event</p>
              </div>
            </Link>
            <Link
              href="/admin/vendors?status=PENDING_REVIEW"
              className="flex items-center gap-4 rounded-xl bg-paper border border-ink/10 shadow-soft p-5 hover:shadow-soft-lg lg:hover:-translate-y-0.5 transition-shadow"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sky/10 text-sky">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div>
                <p className="font-display font-semibold text-ink">Review Vendors</p>
                <p className="text-sm text-ink/60">{stats.pendingVendors} pending</p>
              </div>
            </Link>
            <Link
              href="/admin/analytics"
              className="flex items-center gap-4 rounded-xl bg-paper border border-ink/10 shadow-soft p-5 hover:shadow-soft-lg lg:hover:-translate-y-0.5 transition-shadow"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-grass/10 text-grass">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              </div>
              <div>
                <p className="font-display font-semibold text-ink">View Analytics</p>
                <p className="text-sm text-ink/60">Full platform insights</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
