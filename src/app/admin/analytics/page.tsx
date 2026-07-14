import Link from 'next/link';
import { getPlatformAnalytics } from '@/services/analytics-service';
import BarChart from '@/components/charts/BarChart';
import DonutChart from '@/components/charts/DonutChart';
import RecentActivity from '@/components/dashboard/RecentActivity';

export const metadata = {
  title: 'Platform Analytics',
  description: 'Kids & Family Fun Day Kenya — platform analytics dashboard',
};

const statusColors: Record<string, string> = {
  PUBLISHED: '#16A34A',
  DRAFT: '#F59E0B',
  CANCELLED: '#DC2626',
  SOLD_OUT: '#8B5CF6',
  COMPLETED: '#F59E0B',
  ACTIVE: '#16A34A',
  PENDING_REVIEW: '#F59E0B',
  APPROVED_AWAITING_PAYMENT: '#DC2626',
  REJECTED: '#9CA3AF',
  HIDDEN: '#9CA3AF',
};

const statusLabels: Record<string, string> = {
  PUBLISHED: 'Published',
  DRAFT: 'Draft',
  CANCELLED: 'Cancelled',
  SOLD_OUT: 'Sold Out',
  COMPLETED: 'Completed',
  ACTIVE: 'Active',
  PENDING_REVIEW: 'Pending Review',
  APPROVED_AWAITING_PAYMENT: 'Awaiting Payment',
  REJECTED: 'Rejected',
  HIDDEN: 'Hidden',
};

const statusDotColors: Record<string, string> = {
  PUBLISHED: 'bg-grass',
  DRAFT: 'bg-sun',
  CANCELLED: 'bg-coral',
  SOLD_OUT: 'bg-[#8B5CF6]',
  COMPLETED: 'bg-sky',
  ACTIVE: 'bg-grass',
  PENDING_REVIEW: 'bg-sun',
  APPROVED_AWAITING_PAYMENT: 'bg-coral',
  REJECTED: 'bg-ink/20',
  HIDDEN: 'bg-ink/20',
};

export default async function AdminAnalyticsPage() {
  let analytics;
  try {
    analytics = await getPlatformAnalytics();
  } catch (err) {
    console.error('[ANALYTICS_ERROR]', err);
    analytics = {
      events: { total: 0, published: 0, draft: 0, cancelled: 0, soldOut: 0, completed: 0 },
      bookings: { total: 0, today: 0 },
      tickets: { issued: 0, checkedIn: 0, remaining: 0 },
      users: { total: 0, newThisWeek: 0 },
      vendors: { total: 0, pendingReview: 0, awaitingPayment: 0, active: 0, rejected: 0 },
      reviews: { total: 0, published: 0, hidden: 0 },
      bookingsOverTime: [],
      userRegistrationsOverTime: [],
      eventsByStatus: [],
      vendorsByStatus: [],
      reviewsByStatus: [],
      recentActivity: [],
    };
  }

  const eventsByStatusData = analytics.eventsByStatus.map((e) => ({
    label: statusLabels[e.status] || e.status,
    value: e.count,
    color: statusColors[e.status] || '#9CA3AF',
  }));

  const vendorsByStatusData = analytics.vendorsByStatus.map((v) => ({
    label: statusLabels[v.status] || v.status,
    value: v.count,
    color: statusColors[v.status] || '#9CA3AF',
  }));

  const reviewsByStatusData = analytics.reviewsByStatus.map((r) => ({
    label: statusLabels[r.status] || r.status,
    value: r.count,
    color: statusColors[r.status] || '#9CA3AF',
  }));

  return (
    <div className="max-w-6xl space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink">
          Platform Analytics
        </h2>
        <p className="text-ink/60 mt-1">
          Real-time overview of platform health and activity.
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
                <p className="font-display text-2xl font-bold text-ink mt-0.5">{analytics.bookings.total}</p>
              </div>
            </div>
            <p className="text-xs text-ink/40 mt-3">{analytics.bookings.today} today</p>
          </div>
        </Link>

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
              <p className="font-display text-2xl font-bold text-ink mt-0.5">{analytics.users.total}</p>
            </div>
          </div>
          <p className="text-xs text-ink/40 mt-3">{analytics.users.newThisWeek} new this week</p>
        </div>

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
                <p className="font-display text-2xl font-bold text-ink mt-0.5">{analytics.vendors.active}</p>
              </div>
            </div>
            <p className="text-xs text-ink/40 mt-3">{analytics.vendors.pendingReview} pending review</p>
          </div>
        </Link>

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
              <p className="font-display text-2xl font-bold text-ink mt-0.5">{analytics.tickets.issued}</p>
            </div>
          </div>
          <p className="text-xs text-ink/40 mt-3">{analytics.tickets.remaining} remaining</p>
        </div>
      </div>

      {/* Charts */}
      <section className="space-y-6">
        <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-ink/40">
          Trends
        </h3>

        {/* Time-series charts stacked full-width */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-ink/10 bg-paper p-5 shadow-soft">
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="font-display text-base font-semibold text-ink">Bookings Over Time</h2>
              <span className="text-sm text-ink/40">{analytics.bookings.today} today</span>
            </div>
            <BarChart
              data={analytics.bookingsOverTime.map((m) => ({
                label: m.month,
                value: m.count,
                color: '#0F766E',
              }))}
              height={200}
            />
          </div>

          <div className="rounded-xl border border-ink/10 bg-paper p-5 shadow-soft">
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="font-display text-base font-semibold text-ink">User Registrations</h2>
              <span className="text-sm text-ink/40">{analytics.users.newThisWeek} this week</span>
            </div>
            <BarChart
              data={analytics.userRegistrationsOverTime.map((m) => ({
                label: m.month,
                value: m.count,
                color: '#16A34A',
              }))}
              height={200}
            />
          </div>
        </div>

        {/* Donut charts with inline breakdowns */}
        <div className="grid gap-6 lg:grid-cols-3">
          {eventsByStatusData.length > 0 && (
            <div className="rounded-xl border border-ink/10 bg-paper p-5 shadow-soft">
              <h2 className="font-display text-base font-semibold text-ink mb-4">Events by Status</h2>
              <div className="flex justify-center mb-4">
                <DonutChart data={eventsByStatusData} size={160} />
              </div>
              <div className="space-y-2">
                {eventsByStatusData.map((d) => (
                  <div key={d.label} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full shrink-0 ${statusDotColors[analytics.eventsByStatus.find((e) => statusLabels[e.status] === d.label)?.status || ''] || 'bg-ink/20'}`} />
                      <span className="text-ink/60">{d.label}</span>
                    </div>
                    <span className="font-medium text-ink">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {vendorsByStatusData.length > 0 && (
            <div className="rounded-xl border border-ink/10 bg-paper p-5 shadow-soft">
              <h2 className="font-display text-base font-semibold text-ink mb-4">Vendors by Status</h2>
              <div className="flex justify-center mb-4">
                <DonutChart data={vendorsByStatusData} size={160} />
              </div>
              <div className="space-y-2">
                {vendorsByStatusData.map((d) => (
                  <div key={d.label} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full shrink-0 ${statusDotColors[analytics.vendorsByStatus.find((v) => statusLabels[v.status] === d.label)?.status || ''] || 'bg-ink/20'}`} />
                      <span className="text-ink/60">{d.label}</span>
                    </div>
                    <span className="font-medium text-ink">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {reviewsByStatusData.length > 0 && (
            <div className="rounded-xl border border-ink/10 bg-paper p-5 shadow-soft">
              <h2 className="font-display text-base font-semibold text-ink mb-4">Reviews by Status</h2>
              <div className="flex justify-center mb-4">
                <DonutChart data={reviewsByStatusData} size={160} />
              </div>
              <div className="space-y-2">
                {reviewsByStatusData.map((d) => (
                  <div key={d.label} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full shrink-0 ${statusDotColors[analytics.reviewsByStatus.find((r) => statusLabels[r.status] === d.label)?.status || ''] || 'bg-ink/20'}`} />
                      <span className="text-ink/60">{d.label}</span>
                    </div>
                    <span className="font-medium text-ink">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Recent Activity + Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentActivity items={analytics.recentActivity} />
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
              <p className="font-display font-semibold text-lg text-ink">Create Event</p>
              <p className="text-sm text-ink/60">Set up a new event with ticket types</p>
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
              <p className="font-display font-semibold text-lg text-ink">Review Vendors</p>
              <p className="text-sm text-ink/60">{analytics.vendors.pendingReview} pending approval</p>
            </div>
          </Link>
          <Link
            href="/admin"
            className="flex items-center gap-4 rounded-xl bg-paper border border-ink/10 shadow-soft p-5 hover:shadow-soft-lg lg:hover:-translate-y-0.5 transition-shadow"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-grass/10 text-grass">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </div>
            <div>
              <p className="font-display font-semibold text-lg text-ink">View Overview</p>
              <p className="text-sm text-ink/60">Back to dashboard summary</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
