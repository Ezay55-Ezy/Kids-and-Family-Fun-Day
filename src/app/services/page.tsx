import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import type { Metadata } from 'next';
import type { ServiceCategory } from '@/generated/prisma/enums';

export const metadata: Metadata = {
  title: 'Services',
  description: 'Browse family services available at Kids & Family Fun Day — catering, photography, entertainment, and more.',
};

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

const CATEGORY_ICONS: Record<string, string> = {
  CATERING: '🍽️',
  PHOTOGRAPHY: '📸',
  ENTERTAINMENT: '🎪',
  DECORATIONS: '🎀',
  EQUIPMENT_RENTAL: '⚙️',
  KIDS_ACTIVITIES: '🧸',
  TRANSPORT: '🚌',
  OTHER: '✨',
};

function formatPrice(price: string | number, pricingType: string): string {
  const amount = Number(price);
  if (pricingType === 'CONTACT_VENDOR') return 'Contact Vendor';
  const prefix = pricingType === 'STARTING_FROM' ? 'From ' : '';
  return `${prefix}KES ${amount.toLocaleString()}`;
}

export default async function ServicesPage() {
  let services: Array<{
    id: string;
    name: string;
    shortDescription: string | null;
    price: { toString(): string };
    pricingType: string;
    category: ServiceCategory | null;
    imageUrl: string | null;
    vendor: { businessName: string; user: { name: string | null } };
  }> = [];

  try {
    services = await prisma.service.findMany({
      where: { isActive: true, isArchived: false },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        shortDescription: true,
        price: true,
        pricingType: true,
        category: true,
        imageUrl: true,
        vendor: {
          select: {
            businessName: true,
            user: { select: { name: true } },
          },
        },
      },
    });
  } catch {
    // fallback to empty
  }

  const categories = Object.keys(CATEGORY_LABELS);

  return (
    <div className="min-h-screen bg-paper">
      {/* Hero */}
      <section className="bg-ink text-paper">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-coral uppercase tracking-wider">
              Marketplace
            </p>
            <h1 className="font-display text-3xl md:text-5xl font-bold text-paper mt-3 leading-tight">
              Browse Services
            </h1>
            <p className="mt-5 text-lg text-paper/60 leading-relaxed max-w-2xl">
              Discover trusted vendors offering everything from catering to photography, entertainment, and more.
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-12">
        <h2 className="font-display text-lg font-semibold text-ink">By Category</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Link
              key={cat}
              href={`/services?category=${cat}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-ink/10 bg-white px-3 py-1.5 text-sm text-ink/60 hover:border-coral/30 hover:text-coral transition-colors"
            >
              <span>{CATEGORY_ICONS[cat]}</span>
              {CATEGORY_LABELS[cat]}
            </Link>
          ))}
        </div>
      </section>

      {/* Services Grid */}
      <section className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 pb-20">
        {services.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-ink/40 text-lg">No services available yet.</p>
            <Link href="/vendor/register" className="mt-4 inline-block text-sm font-medium text-coral hover:underline">
              Become a vendor
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Link
                key={service.id}
                href={`/services/${service.id}`}
                className="group rounded-xl border border-ink/10 bg-white overflow-hidden hover:border-ink/20 transition-colors"
              >
                {service.imageUrl ? (
                  <div className="h-44 overflow-hidden bg-ink/[0.03]">
                    <img
                      src={service.imageUrl}
                      alt={service.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="h-44 bg-gradient-to-br from-coral/10 to-ink/[0.03] flex items-center justify-center">
                    <span className="text-3xl">
                      {service.category ? CATEGORY_ICONS[service.category] : '✨'}
                    </span>
                  </div>
                )}
                <div className="p-5">
                  {service.category && (
                    <span className="inline-block text-xs font-medium text-coral uppercase tracking-wider">
                      {CATEGORY_LABELS[service.category]}
                    </span>
                  )}
                  <h3 className="font-display font-semibold text-ink mt-1 group-hover:text-coral transition-colors">
                    {service.name}
                  </h3>
                  {service.shortDescription && (
                    <p className="text-sm text-ink/50 mt-1.5 line-clamp-2">
                      {service.shortDescription}
                    </p>
                  )}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-ink">
                      {formatPrice(service.price.toString(), service.pricingType)}
                    </span>
                    <span className="text-xs text-ink/40">
                      {service.vendor.businessName}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
