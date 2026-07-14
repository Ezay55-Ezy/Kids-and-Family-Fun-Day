import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/auth';
import { getVendorAnalytics } from '@/services/vendor-service';
import StatCard from '@/components/dashboard/StatCard';
import BarChart from '@/components/charts/BarChart';
import DonutChart from '@/components/charts/DonutChart';
import { formatDate } from '@/lib/format';

const categoryLabels: Record<string, string> = {
  CATERING: 'Catering',
  PHOTOGRAPHY: 'Photography',
  ENTERTAINMENT: 'Entertainment',
  DECORATIONS: 'Decorations',
  EQUIPMENT_RENTAL: 'Equipment Rental',
  KIDS_ACTIVITIES: 'Kids Activities',
  TRANSPORT: 'Transport',
  OTHER: 'Other',
};

const chartColors = ['#F05A5A', '#4AC7D9', '#6BC96B', '#F5A623', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

export default async function VendorAnalyticsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  const data = await getVendorAnalytics(session.user.id);

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

  if (data.vendorStatus !== 'ACTIVE') {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <h2 className="font-display text-2xl font-bold text-ink mb-3">Analytics Unavailable</h2>
        <p className="text-ink/60 mb-6 max-w-md">
          Analytics are available once your vendor profile is active. Check back after your account has been approved and activated.
        </p>
        <Link href="/vendor" className="btn-primary">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const categoryData = Object.entries(data.categoryBreakdown)
    .sort(([, a], [, b]) => b - a)
    .map(([key, value], i) => ({
      label: categoryLabels[key] || key,
      value,
      color: chartColors[i % chartColors.length],
    }));

  const statusData = [
    { label: 'Published', value: data.publishedServices, color: '#6BC96B' },
    { label: 'Draft', value: data.draftServices, color: '#F5A623' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Analytics</h1>
        <p className="text-ink/60 mt-1">Overview of your service performance on the platform.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Published Services"
          value={data.publishedServices}
          color="grass"
          icon={
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          }
        />
        <StatCard
          label="Draft Services"
          value={data.draftServices}
          color="sun"
          icon={
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          }
        />
        <StatCard
          label="Total Views"
          value={data.totalViews}
          color="sky"
          icon={
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          }
        />
        <StatCard
          label="Categories Used"
          value={categoryData.length}
          color="coral"
          icon={
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          }
        />
      </div>

      {data.mostViewedService && data.totalViews > 0 && (
        <div className="rounded-xl border border-ink/10 bg-paper p-5 shadow-soft">
          <p className="text-sm font-medium text-ink/60">Most Viewed Service</p>
          <p className="mt-1 font-display text-lg font-bold text-ink">{data.mostViewedService.name}</p>
          <p className="text-sm text-ink/50">{data.mostViewedService.views} marketplace view{data.mostViewedService.views !== 1 ? 's' : ''}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {categoryData.length > 0 && (
          <div className="rounded-xl border border-ink/10 bg-paper p-5 shadow-soft">
            <h2 className="font-display text-base font-semibold text-ink mb-4">Services by Category</h2>
            <BarChart data={categoryData} height={180} />
          </div>
        )}

        {data.totalServices > 0 && (
          <div className="rounded-xl border border-ink/10 bg-paper p-5 shadow-soft">
            <h2 className="font-display text-base font-semibold text-ink mb-4">Published vs Draft</h2>
            <div className="flex justify-center">
              <DonutChart data={statusData} size={160} />
            </div>
          </div>
        )}

        {data.growthByMonth.length > 1 && (
          <div className="rounded-xl border border-ink/10 bg-paper p-5 shadow-soft lg:col-span-2">
            <h2 className="font-display text-base font-semibold text-ink mb-4">Service Growth Over Time</h2>
            <BarChart
              data={data.growthByMonth.map((m, i) => ({
                label: m.month,
                value: m.count,
                color: chartColors[i % chartColors.length],
              }))}
              height={180}
            />
          </div>
        )}
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold text-ink">Service Performance</h2>
          <Link
            href="/vendor/services"
            className="text-sm font-medium text-coral hover:text-coral/80 transition-colors"
          >
            Manage Services &rarr;
          </Link>
        </div>

        {data.services.length === 0 ? (
          <div className="rounded-xl border border-ink/10 bg-paper p-12 text-center">
            <svg className="h-8 w-8 mx-auto text-ink/20 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
            <p className="text-sm text-ink/40">No services found.</p>
            <Link href="/vendor/services/new" className="btn-primary mt-4 inline-flex">
              Create Service
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-ink/10 shadow-soft">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-ink/5 text-ink/60 text-left">
                  <th className="px-4 py-3 font-medium">Service Name</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium">Views</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {data.services.map((s) => (
                  <tr key={s.id} className="hover:bg-ink/5 transition-colors">
                    <td className="px-4 py-3 text-ink font-medium">{s.name}</td>
                    <td className="px-4 py-3 text-ink/60">{categoryLabels[s.category ?? 'OTHER'] || s.category}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${s.isActive ? 'bg-grass/10 text-grass' : 'bg-sun/10 text-sun'}`}>
                        {s.isActive ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink/50 text-xs">{formatDate(s.createdAt)}</td>
                    <td className="px-4 py-3 text-ink/60">{s.views}</td>
                    <td className="px-4 py-3 text-ink font-medium">
                      {s.pricingType === 'CONTACT_VENDOR' ? (
                        <span className="text-ink/40 text-xs">Contact Vendor</span>
                      ) : (
                        <>KSh {s.price.toLocaleString()}{s.pricingType === 'STARTING_FROM' && <span className="text-ink/40 text-xs">+</span>}</>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
