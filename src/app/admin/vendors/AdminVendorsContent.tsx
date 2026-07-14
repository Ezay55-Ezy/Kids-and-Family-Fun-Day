'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatDate } from '@/lib/format';

interface VendorUser {
  id: string;
  name: string | null;
  email: string | null;
}

interface VendorItem {
  id: string;
  businessName: string;
  description: string;
  status: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  approvedAt: string | null;
  rejectedReason: string | null;
  user: VendorUser;
  _count: { services: number };
}

const statusStyles: Record<string, string> = {
  PENDING_REVIEW: 'bg-sun/10 text-sun ring-sun/20',
  APPROVED_AWAITING_PAYMENT: 'bg-sky/10 text-sky ring-sky/20',
  ACTIVE: 'bg-grass/10 text-grass ring-grass/20',
  REJECTED: 'bg-coral/10 text-coral ring-coral/20',
};

const statusLabels: Record<string, string> = {
  PENDING_REVIEW: 'Pending Review',
  APPROVED_AWAITING_PAYMENT: 'Awaiting Payment',
  ACTIVE: 'Active',
  REJECTED: 'Rejected',
};

const filterTabs = [
  { label: 'All', value: '' },
  { label: 'Pending Review', value: 'PENDING_REVIEW' },
  { label: 'Awaiting Payment', value: 'APPROVED_AWAITING_PAYMENT' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Rejected', value: 'REJECTED' },
];

export default function AdminVendorsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [vendors, setVendors] = useState<VendorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const currentStatus = searchParams.get('status') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (currentStatus) params.set('status', currentStatus);
      if (currentSearch) params.set('search', currentSearch);
      params.set('page', String(currentPage));

      const res = await fetch(`/api/admin/vendors?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setVendors(data.vendors);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      setError('Failed to load vendor applications.');
    } finally {
      setLoading(false);
    }
  }, [currentStatus, currentSearch, currentPage]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    if (updates.status !== undefined || updates.search !== undefined) {
      params.delete('page');
    }
    router.push(`/admin/vendors?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateParams({ search: (formData.get('search') as string) || '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="font-display font-semibold text-2xl text-ink">Vendor Applications</h2>
        <p className="text-sm text-ink/50">{total} total</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex gap-1 bg-ink/5 rounded-lg p-1 overflow-x-auto">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => updateParams({ status: tab.value })}
              className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                currentStatus === tab.value
                  ? 'bg-paper text-ink shadow-soft'
                  : 'text-ink/50 hover:text-ink'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 sm:ml-auto">
          <input
            name="search"
            type="text"
            defaultValue={currentSearch}
            placeholder="Search vendors..."
            className="input-field text-sm"
          />
          <button type="submit" className="btn-primary text-sm">
            Search
          </button>
        </form>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-ink/5 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl bg-coral/10 border border-coral/20 p-4 text-sm text-coral">
          {error}
        </div>
      ) : vendors.length === 0 ? (
        <div className="rounded-xl bg-paper border border-ink/10 p-12 text-center">
          <svg className="h-12 w-12 mx-auto text-ink/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          </svg>
          <h3 className="mt-4 font-display font-semibold text-lg text-ink">No vendor applications found</h3>
          <p className="mt-1 text-sm text-ink/50">
            {currentStatus || currentSearch
              ? 'Try adjusting your filters or search terms.'
              : 'No vendors have applied yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {vendors.map((vendor) => (
            <Link
              key={vendor.id}
              href={`/admin/vendors/${vendor.id}`}
              className="block rounded-xl bg-paper border border-ink/10 shadow-soft overflow-hidden hover:border-coral/30 transition-colors"
            >
              <div className="flex items-center gap-4 p-4 md:p-6">
                <div className="h-12 w-12 shrink-0 rounded-full bg-coral/10 flex items-center justify-center text-coral font-display font-bold text-lg">
                  {vendor.businessName.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-semibold text-base text-ink truncate">
                      {vendor.businessName}
                    </h3>
                    <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${statusStyles[vendor.status] || ''}`}>
                      {statusLabels[vendor.status] || vendor.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-ink/50">
                    <span>{vendor.user.name || vendor.user.email || 'Unknown'}</span>
                    <span>Applied {formatDate(vendor.createdAt)}</span>
                    <span>{vendor._count.services} service{vendor._count.services !== 1 ? 's' : ''}</span>
                  </div>
                </div>

                <svg className="h-5 w-5 shrink-0 text-ink/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </Link>
          ))}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => updateParams({ page: String(currentPage - 1) })}
                className="btn-secondary text-sm disabled:opacity-30"
              >
                Previous
              </button>
              <span className="text-sm text-ink/50">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => updateParams({ page: String(currentPage + 1) })}
                className="btn-secondary text-sm disabled:opacity-30"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}