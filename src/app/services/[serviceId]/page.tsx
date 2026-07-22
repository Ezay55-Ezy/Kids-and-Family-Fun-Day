import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublicServiceById, ServiceNotFoundError } from '@/services/vendor-service';

const CATEGORY_LABELS: Record<string, string> = {
  CATERING: 'Catering',
  PHOTOGRAPHY: 'Photography',
  ENTERTAINMENT: 'Entertainment',
  DECORATIONS: 'Decorations',
  EQUIPMENT_RENTAL: 'Equipment Rental',
  KIDS_ACTIVITIES: 'Kids Activities',
  TRANSPORT: 'Transport',
  OTHER: 'Other',
};

function formatPrice(price: string, pricingType: string): string {
  const amount = new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
  }).format(Number(price));

  if (pricingType === 'STARTING_FROM') return `From ${amount}`;
  if (pricingType === 'CONTACT_VENDOR') return 'Contact Vendor';
  return amount;
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ serviceId: string }>;
}) {
  const { serviceId } = await params;

  let service;
  try {
    service = await getPublicServiceById(serviceId);
  } catch (error) {
    if (error instanceof ServiceNotFoundError) notFound();
    throw error;
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-ink/10 bg-paper/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-coral text-paper text-sm font-bold">
              KF
            </span>
            <span className="font-display text-lg font-bold text-ink hidden sm:inline">
              Kids &amp; Family Fun Day
            </span>
          </Link>
        </div>
      </header>

      <main>
        <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8 py-12">
          <Link
            href={`/vendors/${service.vendor.id}`}
            className="inline-flex text-sm text-ink/50 hover:text-ink transition-colors mb-6"
          >
            &larr; Back to vendor
          </Link>

          <div className="rounded-xl bg-paper border border-ink/10 shadow-soft-lg overflow-hidden">
            {service.imageUrl ? (
              <div className="aspect-[16/9] sm:aspect-[21/9] overflow-hidden bg-ink/5">
                <img
                  src={service.imageUrl}
                  alt={service.name}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-[16/9] sm:aspect-[21/9] bg-gradient-to-br from-sky/20 via-sun/20 to-grass/20 flex items-center justify-center">
                <svg className="h-16 w-16 text-ink/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="m21 15-5-5L5 21" />
                </svg>
              </div>
            )}

            <div className="p-6 md:p-10">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    {service.category && (
                      <span className="inline-flex items-center rounded-full bg-sky/10 text-sky text-xs font-medium px-2.5 py-0.5">
                        {CATEGORY_LABELS[service.category] || service.category}
                      </span>
                    )}
                    {service.pricingType === 'STARTING_FROM' && (
                      <span className="inline-flex items-center rounded-full bg-sun/10 text-sun text-xs font-medium px-2.5 py-0.5">
                        Starting From
                      </span>
                    )}
                    {service.pricingType === 'CONTACT_VENDOR' && (
                      <span className="inline-flex items-center rounded-full bg-sky/10 text-sky text-xs font-medium px-2.5 py-0.5">
                        Contact Vendor
                      </span>
                    )}
                  </div>
                  <h1 className="font-display text-3xl font-bold text-ink">
                    {service.name}
                  </h1>
                </div>
                <span className="shrink-0 font-display text-2xl font-bold text-coral">
                  {formatPrice(service.price, service.pricingType)}
                </span>
              </div>

              <p className="mt-4 text-base text-ink/70 leading-relaxed whitespace-pre-line">
                {service.description}
              </p>

              {service.boothLocation && (
                <div className="mt-6 flex items-center gap-2 text-sm text-ink/60">
                  <svg className="h-5 w-5 shrink-0 text-ink/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>Booth {service.boothLocation}</span>
                </div>
              )}

              <div className="mt-8 rounded-xl bg-ink/5 p-6">
                <div className="flex items-center gap-4">
                  <Link
                    href={`/vendors/${service.vendor.id}`}
                    className="shrink-0"
                  >
                    <div className="h-14 w-14 rounded-full bg-coral/10 flex items-center justify-center text-coral font-display font-bold text-lg">
                      {service.vendor.businessName.charAt(0).toUpperCase()}
                    </div>
                  </Link>
                  <div className="min-w-0">
                    <Link
                      href={`/vendors/${service.vendor.id}`}
                      className="font-display font-semibold text-lg text-ink hover:text-coral transition-colors"
                    >
                      {service.vendor.businessName}
                    </Link>
                    <p className="text-sm text-ink/50">{service.vendor.description}</p>
                  </div>
                </div>

                {(service.vendor.user.email || service.vendor.user.phone) && (
                  <div className="mt-4 pt-4 border-t border-ink/10 space-y-1.5 text-sm text-ink/60">
                    <p className="text-xs font-medium text-ink/40 uppercase tracking-wider">Contact</p>
                    {service.vendor.user.email && (
                      <a href={`mailto:${service.vendor.user.email}`} className="flex items-center gap-2 hover:text-ink transition-colors">
                        <svg className="h-4 w-4 shrink-0 text-ink/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <rect x="2" y="4" width="20" height="16" rx="2" />
                          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                        </svg>
                        <span>{service.vendor.user.email}</span>
                      </a>
                    )}
                    {service.vendor.user.phone && (
                      <a href={`tel:${service.vendor.user.phone}`} className="flex items-center gap-2 hover:text-ink transition-colors">
                        <svg className="h-4 w-4 shrink-0 text-ink/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                        <span>{service.vendor.user.phone}</span>
                      </a>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-8 rounded-xl bg-sky/5 border border-sky/20 p-5">
                <div className="flex items-start gap-3">
                  <svg className="h-5 w-5 shrink-0 text-sky mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-ink">
                      Payment is completed directly with the Vendor.
                    </p>
                    <p className="mt-1 text-sm text-ink/50">
                      Accepted payment methods: Cash, M-Pesa, Card
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-ink/10 bg-paper py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 text-center text-sm text-ink/50">
          <p>&copy; 2026 Kids &amp; Family Fun Day Kenya. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
