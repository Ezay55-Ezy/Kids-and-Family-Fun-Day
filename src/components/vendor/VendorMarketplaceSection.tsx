'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import VendorCard, { VendorCardService, VendorCardVendor } from './VendorCard';
import ServiceSkeleton from './ServiceSkeleton';

type Sort = 'name' | 'price_asc' | 'price_desc';

interface RawVendor {
  id: string;
  businessName: string;
  description: string;
  services: {
    id: string;
    name: string;
    shortDescription: string | null;
    category: string | null;
    price: string;
    pricingType: string;
    imageUrl: string | null;
    boothLocation: string | null;
    isActive: boolean;
  }[];
}

const CATEGORY_OPTIONS = [
  { value: '', label: 'All Categories' },
  { value: 'CATERING', label: 'Catering' },
  { value: 'PHOTOGRAPHY', label: 'Photography' },
  { value: 'ENTERTAINMENT', label: 'Entertainment' },
  { value: 'DECORATIONS', label: 'Decorations' },
  { value: 'EQUIPMENT_RENTAL', label: 'Equipment Rental' },
  { value: 'KIDS_ACTIVITIES', label: 'Kids Activities' },
  { value: 'TRANSPORT', label: 'Transport' },
  { value: 'OTHER', label: 'Other' },
];

const SORT_OPTIONS: { value: Sort; label: string }[] = [
  { value: 'name', label: 'A–Z' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

export default function VendorMarketplaceSection() {
  const [vendors, setVendors] = useState<RawVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState<Sort>('name');
  const [total, setTotal] = useState(0);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (category) params.set('category', category);
      params.set('sort', sort);

      const res = await fetch(`/api/vendors/marketplace?${params.toString()}`, {
        cache: 'no-store',
      });

      if (!res.ok) throw new Error('Failed to load vendors');

      const data = await res.json();
      setVendors(data.vendors ?? []);
      setTotal(data.total ?? 0);
    } catch {
      setError('Something went wrong loading vendors. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [search, category, sort]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fetchVendors, 300);
    return () => clearTimeout(debounceRef.current);
  }, [fetchVendors]);

  const serviceCards: { service: VendorCardService; vendor: VendorCardVendor }[] = [];
  for (const vendor of vendors) {
    for (const service of vendor.services) {
      serviceCards.push({
        service: {
          id: service.id,
          name: service.name,
          shortDescription: service.shortDescription,
          category: service.category,
          price: service.price,
          pricingType: service.pricingType,
          imageUrl: service.imageUrl,
          boothLocation: service.boothLocation,
        },
        vendor: { id: vendor.id, businessName: vendor.businessName },
      });
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 mt-16 mb-12">
      <h2 className="font-display text-2xl font-bold text-ink mb-2">
        Available Vendors
      </h2>
      <p className="text-ink/60 mb-8 max-w-xl">
        Discover vendors and services available at our events.
      </p>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div className="relative flex-1 max-w-md">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="search"
            placeholder="Search vendors or services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-base pl-10"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input-base w-auto min-w-[150px] py-2.5 text-sm"
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="input-base w-auto min-w-[140px] py-2.5 text-sm"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {total > 0 && !loading && (
        <p className="text-sm text-ink/40 mb-4">{total} service{total !== 1 ? 's' : ''} available</p>
      )}

      {loading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ServiceSkeleton key={i} />
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="rounded-xl border border-coral/20 bg-coral/5 p-6 text-center">
          <p className="text-coral font-medium">{error}</p>
          <button
            onClick={fetchVendors}
            className="btn-secondary mt-4 text-sm"
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && serviceCards.length === 0 && (
        <div className="rounded-xl border border-ink/10 bg-ink/5 p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-ink/10">
            <svg className="h-8 w-8 text-ink/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
          </div>
          <h3 className="font-display text-lg font-semibold text-ink">
            {search || category
              ? 'No matching vendors or services found'
              : 'No vendors available yet'}
          </h3>
          <p className="mt-1.5 text-sm text-ink/50 max-w-sm mx-auto">
            {search || category
              ? 'Try adjusting your search or filters to find what you are looking for.'
              : 'Check back soon for vendor services.'}
          </p>
        </div>
      )}

      {!loading && !error && serviceCards.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {serviceCards.map((card) => (
            <VendorCard key={card.service.id} service={card.service} vendor={card.vendor} />
          ))}
        </div>
      )}
    </section>
  );
}
