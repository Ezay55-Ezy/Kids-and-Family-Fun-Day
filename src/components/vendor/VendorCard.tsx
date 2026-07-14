import Link from 'next/link';

export interface VendorCardService {
  id: string;
  name: string;
  shortDescription: string | null;
  category: string | null;
  price: string;
  pricingType: string;
  imageUrl: string | null;
  boothLocation: string | null;
}

export interface VendorCardVendor {
  id: string;
  businessName: string;
}

export interface VendorCardProps {
  service: VendorCardService;
  vendor: VendorCardVendor;
}

const CATEGORY_COLORS: Record<string, string> = {
  CATERING: 'bg-sun/10 text-sun ring-sun/20',
  PHOTOGRAPHY: 'bg-sky/10 text-sky ring-sky/20',
  ENTERTAINMENT: 'bg-coral/10 text-coral ring-coral/20',
  DECORATIONS: 'bg-grass/10 text-grass ring-grass/20',
  EQUIPMENT_RENTAL: 'bg-ink/10 text-ink/60 ring-ink/20',
  KIDS_ACTIVITIES: 'bg-grass/10 text-grass ring-grass/20',
  TRANSPORT: 'bg-sky/10 text-sky ring-sky/20',
  OTHER: 'bg-ink/5 text-ink/50 ring-ink/20',
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

export default function VendorCard({ service, vendor }: VendorCardProps) {
  const catColor = CATEGORY_COLORS[service.category || 'OTHER'] || CATEGORY_COLORS.OTHER;
  const catLabel = CATEGORY_LABELS[service.category || 'OTHER'] || service.category;

  return (
    <article className="group relative flex flex-col rounded-xl bg-paper border border-ink/10 shadow-soft overflow-hidden transition-shadow duration-300 hover:shadow-soft-lg lg:hover:-translate-y-0.5">
      <Link href={`/services/${service.id}`} className="flex flex-1 flex-col">
        <div className="relative aspect-[16/9] overflow-hidden bg-ink/5">
          {service.imageUrl ? (
            <img
              src={service.imageUrl}
              alt={service.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-sky/20 via-sun/20 to-grass/20 flex items-center justify-center">
              <svg className="h-12 w-12 text-ink/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" />
              </svg>
            </div>
          )}
          <span className={`absolute top-3 left-3 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${catColor}`}>
            {catLabel}
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-2 p-5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-display font-semibold text-base text-ink line-clamp-1">
              {service.name}
            </h3>
            <span className="shrink-0 font-semibold text-sm text-ink">
              {formatPrice(service.price, service.pricingType)}
            </span>
          </div>

          <p className="text-xs text-ink/40">
            by {vendor.businessName}
          </p>

          {service.shortDescription && (
            <p className="text-sm text-ink/60 line-clamp-2 leading-relaxed flex-1">
              {service.shortDescription}
            </p>
          )}

          {service.boothLocation && (
            <div className="flex items-center gap-1 text-xs text-ink/40">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>Booth {service.boothLocation}</span>
            </div>
          )}

          <div className="mt-auto pt-2">
            <span className="btn-secondary w-full text-sm py-2.5 inline-flex items-center justify-center">
              View Service
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
