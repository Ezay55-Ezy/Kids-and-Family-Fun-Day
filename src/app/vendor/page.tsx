import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/auth';
import { getVendorDashboard } from '@/services/vendor-service';
import StatCard from '@/components/dashboard/StatCard';
import { formatCurrency, formatRelativeTime } from '@/lib/format';

const STATUS_LABELS: Record<string, string> = {
  PENDING_REVIEW: 'Pending Review',
  APPROVED_AWAITING_PAYMENT: 'Approved — Awaiting Payment',
  ACTIVE: 'Active',
  REJECTED: 'Not Approved',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING_REVIEW: 'bg-sun/10 text-sun ring-sun/20',
  APPROVED_AWAITING_PAYMENT: 'bg-sky/10 text-sky ring-sky/20',
  ACTIVE: 'bg-grass/10 text-grass ring-grass/20',
  REJECTED: 'bg-coral/10 text-coral ring-coral/20',
};

export default async function VendorDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  const data = await getVendorDashboard(session.user.id);

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <h2 className="font-display text-2xl font-bold text-ink mb-3">No Vendor Profile</h2>
        <p className="text-ink/60 mb-6 max-w-md">
          You haven&apos;t registered as a vendor yet. Start offering your services at our events.
        </p>
        <Link href="/become-a-vendor" className="btn-primary">
          Become a Vendor
        </Link>
      </div>
    );
  }

  const { vendor, recentBookings, totalRevenue } = data;
  const statusColor = STATUS_COLORS[vendor.status] || STATUS_COLORS.PENDING_REVIEW;
  const statusLabel = STATUS_LABELS[vendor.status] || vendor.status;

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-display text-2xl font-bold text-ink">{vendor.businessName}</h1>
              <span className={`inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium ring-1 ${statusColor}`}>
                {statusLabel}
              </span>
            </div>
            <p className="text-ink/60">Vendor since {new Date(vendor.createdAt).toLocaleDateString('en-KE', { month: 'long', year: 'numeric' })}</p>
          </div>
        </div>

        {vendor.status === 'REJECTED' && vendor.rejectedReason && (
          <div className="mt-4 rounded-lg bg-coral/10 border border-coral/20 p-4 text-sm text-coral" role="alert">
            <p className="font-medium">Application not approved</p>
            <p className="mt-1">{vendor.rejectedReason}</p>
          </div>
        )}

        {vendor.status === 'PENDING_REVIEW' && (
          <div className="mt-4 rounded-lg bg-sun/10 border border-sun/20 p-4 text-sm text-sun">
            <p className="font-medium">Application Under Review</p>
            <p className="mt-1 text-ink/60">
              Your vendor application is being reviewed by our team. You&apos;ll be notified once it&apos;s approved.
            </p>
          </div>
        )}

        {vendor.status === 'APPROVED_AWAITING_PAYMENT' && (
          <div className="mt-4 rounded-lg bg-sky/10 border border-sky/20 p-4 text-sm text-sky">
            <p className="font-medium">Application Approved — Payment Required</p>
            <p className="mt-1 text-ink/60">
              Your application has been approved! Please contact the event organizer to complete the participation fee and activate your account.
            </p>
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Services"
          value={vendor.services.length}
          icon={
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
          }
          color="coral"
        />
        <StatCard
          label="Total Bookings"
          value={vendor._count.bookings}
          icon={
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          }
          color="sky"
        />
        <StatCard
          label="Revenue (KSh)"
          value={totalRevenue}
          icon={
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          }
          color="grass"
        />
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold text-ink">Your Services</h2>
          <Link
            href="/vendor/services"
            className="text-sm font-medium text-coral hover:text-coral/80 transition-colors"
          >
            Manage Services &rarr;
          </Link>
        </div>
        {vendor.services.length > 0 ? (
          <div className="space-y-3">
            {vendor.services.map((service) => (
              <div key={service.id} className="rounded-xl border border-ink/10 bg-paper p-5 shadow-soft">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-ink">{service.name}</h3>
                    {service.description && (
                      <p className="text-sm text-ink/60 mt-1">{service.description}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="font-semibold text-ink">{formatCurrency(Number(service.price))}</p>
                    <span className={`inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${service.isActive ? 'bg-grass/10 text-grass' : 'bg-ink/10 text-ink/50'}`}>
                      {service.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink/40 py-8 text-center">No services yet.</p>
        )}
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink mb-4">Recent Bookings</h2>
        {recentBookings.length === 0 ? (
          <p className="text-sm text-ink/40 py-8 text-center">No bookings yet.</p>
        ) : (
          <div className="space-y-2">
            {recentBookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between rounded-lg border border-ink/10 bg-paper px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-ink">{booking.user.name || 'Anonymous'}</p>
                  <p className="text-xs text-ink/40">
                    {formatRelativeTime(new Date(booking.createdAt))}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-ink">{formatCurrency(Number(booking.totalAmount))}</p>
                  <span className={`text-xs font-medium ${
                    booking.status === 'CONFIRMED' ? 'text-grass' :
                    booking.status === 'COMPLETED' ? 'text-sky' :
                    booking.status === 'CANCELLED' ? 'text-coral' :
                    'text-ink/50'
                  }`}>
                    {booking.status === 'CONFIRMED' ? 'Confirmed' :
                     booking.status === 'COMPLETED' ? 'Completed' :
                     booking.status === 'CANCELLED' ? 'Cancelled' :
                     booking.status === 'PENDING' ? 'Pending' :
                     booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
