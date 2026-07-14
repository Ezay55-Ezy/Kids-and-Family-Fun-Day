'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatDate, formatCurrency } from '@/lib/format';

type ReportType = 'events' | 'bookings' | 'users' | 'vendors' | 'reviews';

interface ReportStats {
  total: number;
  filtered: number;
  generatedAt: string;
}

interface ReportResult {
  rows: Record<string, unknown>[];
  total: number;
  filtered: number;
  page: number;
  totalPages: number;
  stats: ReportStats;
}

const reportTabs: { label: string; value: ReportType }[] = [
  { label: 'Events', value: 'events' },
  { label: 'Bookings', value: 'bookings' },
  { label: 'Users', value: 'users' },
  { label: 'Vendors', value: 'vendors' },
  { label: 'Reviews', value: 'reviews' },
];

const statusOptions: Record<ReportType, { label: string; value: string }[]> = {
  events: [
    { label: 'All', value: '' },
    { label: 'Draft', value: 'DRAFT' },
    { label: 'Published', value: 'PUBLISHED' },
    { label: 'Sold Out', value: 'SOLD_OUT' },
    { label: 'Cancelled', value: 'CANCELLED' },
    { label: 'Completed', value: 'COMPLETED' },
  ],
  bookings: [
    { label: 'All', value: '' },
    { label: 'Requested', value: 'REQUESTED' },
    { label: 'Confirmed', value: 'CONFIRMED' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Cancelled', value: 'CANCELLED' },
    { label: 'Declined', value: 'DECLINED' },
  ],
  users: [
    { label: 'All', value: '' },
    { label: 'Active', value: 'active' },
    { label: 'Suspended', value: 'inactive' },
  ],
  vendors: [
    { label: 'All', value: '' },
    { label: 'Pending', value: 'PENDING_REVIEW' },
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Rejected', value: 'REJECTED' },
  ],
  reviews: [
    { label: 'All', value: '' },
    { label: 'Published', value: 'PUBLISHED' },
    { label: 'Hidden', value: 'HIDDEN' },
  ],
};

const roleOptions = [
  { label: 'All Roles', value: '' },
  { label: 'Admin', value: 'ADMIN' },
  { label: 'Vendor', value: 'VENDOR' },
  { label: 'Customer', value: 'CUSTOMER' },
  { label: 'Sponsor', value: 'SPONSOR' },
];

const reportColumns: Record<ReportType, { key: string; label: string; format?: string }[]> = {
  events: [
    { key: 'title', label: 'Event Name' },
    { key: 'status', label: 'Status' },
    { key: 'capacity', label: 'Capacity' },
    { key: 'ticketsSold', label: 'Sold' },
    { key: 'remaining', label: 'Remaining' },
    { key: 'location', label: 'Location' },
    { key: 'startDate', label: 'Start Date', format: 'date' },
    { key: 'createdAt', label: 'Created', format: 'date' },
  ],
  bookings: [
    { key: 'bookingRef', label: 'Ref' },
    { key: 'customerName', label: 'Customer' },
    { key: 'eventTitle', label: 'Event' },
    { key: 'ticketCount', label: 'Tickets' },
    { key: 'totalAmount', label: 'Amount', format: 'currency' },
    { key: 'status', label: 'Status' },
    { key: 'createdAt', label: 'Date', format: 'date' },
  ],
  users: [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    { key: 'isActive', label: 'Status', format: 'boolean' },
    { key: 'bookingCount', label: 'Bookings' },
    { key: 'reviewCount', label: 'Reviews' },
    { key: 'createdAt', label: 'Registered', format: 'date' },
  ],
  vendors: [
    { key: 'businessName', label: 'Business' },
    { key: 'ownerName', label: 'Owner' },
    { key: 'status', label: 'Status' },
    { key: 'serviceCount', label: 'Services' },
    { key: 'bookingCount', label: 'Bookings' },
    { key: 'createdAt', label: 'Registered', format: 'date' },
  ],
  reviews: [
    { key: 'eventTitle', label: 'Event' },
    { key: 'reviewerName', label: 'Reviewer' },
    { key: 'rating', label: 'Rating', format: 'rating' },
    { key: 'comment', label: 'Comment' },
    { key: 'status', label: 'Status' },
    { key: 'createdAt', label: 'Date', format: 'date' },
  ],
};

function formatRating(rating: number) {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating);
}

function formatBoolean(value: boolean) {
  return value ? 'Active' : 'Suspended';
}

function formatCell(value: unknown, format?: string): string {
  if (value === null || value === undefined) return '';
  switch (format) {
    case 'date': return formatDate(String(value));
    case 'currency': return formatCurrency(Number(value));
    case 'rating': return formatRating(Number(value));
    case 'boolean': return formatBoolean(Boolean(value));
    default: return String(value);
  }
}

function statusBadgeClass(status: string): string {
  const s = status.toUpperCase();
  if (s === 'PUBLISHED' || s === 'ACTIVE' || s === 'CONFIRMED' || s === 'COMPLETED') return 'bg-grass/10 text-grass ring-grass/20';
  if (s === 'DRAFT' || s === 'REQUESTED' || s === 'PENDING_REVIEW') return 'bg-sun/10 text-sun ring-sun/20';
  if (s === 'CANCELLED' || s === 'REJECTED' || s === 'DECLINED' || s === 'HIDDEN') return 'bg-coral/10 text-coral ring-coral/20';
  if (s === 'SOLD_OUT') return 'bg-sky/10 text-sky ring-sky/20';
  return 'bg-ink/5 text-ink/60 ring-ink/10';
}

export default function AdminReportsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentType = (searchParams.get('type') as ReportType) || 'events';
  const currentStatus = searchParams.get('status') || '';
  const currentQuery = searchParams.get('query') || '';
  const currentRole = searchParams.get('role') || '';
  const currentEventId = searchParams.get('eventId') || '';
  const currentVendorId = searchParams.get('vendorId') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const [data, setData] = useState<ReportResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      params.set('type', currentType);
      if (currentStatus) params.set('status', currentStatus);
      if (currentQuery) params.set('query', currentQuery);
      if (currentRole) params.set('role', currentRole);
      if (currentEventId) params.set('eventId', currentEventId);
      if (currentVendorId) params.set('vendorId', currentVendorId);
      params.set('page', String(currentPage));
      params.set('limit', '20');

      const res = await fetch(`/api/admin/reports?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      setData(await res.json());
    } catch {
      setError('Failed to load report data');
    } finally {
      setLoading(false);
    }
  }, [currentType, currentStatus, currentQuery, currentRole, currentEventId, currentVendorId, currentPage]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    if (key !== 'page') params.delete('page');
    router.push(`?${params.toString()}`);
  }

  function handleTypeChange(type: ReportType) {
    const params = new URLSearchParams();
    params.set('type', type);
    router.push(`?${params.toString()}`);
  }

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = (formData.get('query') as string) || '';
    updateParam('query', query);
  }

  async function handleExport(format: 'csv' | 'xlsx') {
    setExporting(true);
    try {
      const res = await fetch('/api/admin/reports/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: currentType,
          format,
          query: currentQuery || undefined,
          status: currentStatus || undefined,
          role: currentRole || undefined,
          eventId: currentEventId || undefined,
          vendorId: currentVendorId || undefined,
        }),
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const ext = format === 'csv' ? 'csv' : 'xlsx';
      a.download = `${currentType}-report.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('Export failed');
    } finally {
      setExporting(false);
    }
  }

  const columns = reportColumns[currentType] || [];
  const statuses = statusOptions[currentType] || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-ink">Reports</h1>
        <p className="mt-1 font-body text-ink/60">Generate and export platform data reports</p>
      </div>

      {/* Report Type Tabs */}
      <div className="flex gap-1 rounded-lg bg-ink/5 p-1">
        {reportTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTypeChange(tab.value)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              currentType === tab.value
                ? 'bg-white text-ink shadow-sm'
                : 'text-ink/60 hover:text-ink'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      {data && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-ink/5 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-ink/50">Total Records</p>
            <p className="mt-1 text-2xl font-bold text-ink">{data.stats.total.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-ink/5 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-ink/50">Filtered</p>
            <p className="mt-1 text-2xl font-bold text-sky">{data.stats.filtered.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-ink/5 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-ink/50">This Page</p>
            <p className="mt-1 text-2xl font-bold text-grass">{data.rows.length}</p>
          </div>
          <div className="rounded-xl border border-ink/5 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-ink/50">Generated</p>
            <p className="mt-1 text-sm font-bold text-ink">{formatDate(data.stats.generatedAt)}</p>
          </div>
        </div>
      )}

      {/* Filters Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-3">
          {/* Status Filter */}
          <div className="flex gap-1 rounded-lg bg-ink/5 p-1">
            {statuses.map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateParam('status', opt.value)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  currentStatus === opt.value
                    ? 'bg-white text-ink shadow-sm'
                    : 'text-ink/60 hover:text-ink'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Role Filter (users only) */}
          {currentType === 'users' && (
            <select
              value={currentRole}
              onChange={(e) => updateParam('role', e.target.value)}
              className="rounded-lg border border-ink/10 bg-white px-3 py-1.5 text-xs font-medium text-ink focus:border-sky focus:outline-none focus:ring-1 focus:ring-sky"
            >
              {roleOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          )}
        </div>

        <div className="flex gap-2">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              name="query"
              defaultValue={currentQuery}
              placeholder="Search..."
              className="rounded-lg border border-ink/10 bg-white px-3 py-1.5 text-sm text-ink placeholder:text-ink/40 focus:border-sky focus:outline-none focus:ring-1 focus:ring-sky"
            />
            <button type="submit" className="rounded-lg bg-ink px-3 py-1.5 text-sm font-medium text-white hover:bg-ink/90">
              Search
            </button>
          </form>

          {/* Export Buttons */}
          <button
            onClick={() => handleExport('csv')}
            disabled={exporting || !data || data.rows.length === 0}
            className="rounded-lg border border-ink/10 bg-white px-3 py-1.5 text-sm font-medium text-ink/60 hover:bg-ink/5 disabled:opacity-50"
          >
            {exporting ? '...' : 'CSV'}
          </button>
          <button
            onClick={() => handleExport('xlsx')}
            disabled={exporting || !data || data.rows.length === 0}
            className="rounded-lg border border-ink/10 bg-white px-3 py-1.5 text-sm font-medium text-ink/60 hover:bg-ink/5 disabled:opacity-50"
          >
            {exporting ? '...' : 'Excel'}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-coral/10 p-3 text-sm text-coral">{error}</div>
      )}

      {/* Data Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-xl bg-ink/5" />
          ))}
        </div>
      ) : !data || data.rows.length === 0 ? (
        <div className="rounded-xl border border-ink/5 bg-white p-12 text-center">
          <p className="text-ink/40">No data found for this report</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-ink/5 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink/5 bg-ink/[0.02]">
                {columns.map((col) => (
                  <th key={col.key} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-ink/50">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {data.rows.map((row, idx) => (
                <tr key={idx} className="transition-colors hover:bg-sky/[0.02]">
                  {columns.map((col) => {
                    const value = row[col.key];
                    const formatted = formatCell(value, col.format);
                    const isStatus = col.key === 'status' && typeof value === 'string';
                    return (
                      <td key={col.key} className="px-4 py-3 text-ink">
                        {isStatus ? (
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${statusBadgeClass(String(value))}`}>
                            {formatted}
                          </span>
                        ) : col.key === 'comment' ? (
                          <span className="max-w-[200px] truncate block text-ink/60" title={formatted}>{formatted || '—'}</span>
                        ) : col.format === 'rating' ? (
                          <span className="text-sun">{formatted}</span>
                        ) : col.format === 'boolean' ? (
                          <span className={value ? 'text-grass' : 'text-coral'}>{formatted}</span>
                        ) : (
                          <span>{formatted}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-ink/50">
            Showing {((data.page - 1) * 20) + 1}–{Math.min(data.page * 20, data.filtered)} of {data.filtered.toLocaleString()}
          </p>
          <div className="flex gap-1">
            {Array.from({ length: Math.min(data.totalPages, 10) }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => updateParam('page', page === 1 ? '' : String(page))}
                className={`rounded-md px-3 py-1 text-sm font-medium ${
                  page === data.page ? 'bg-ink text-white' : 'text-ink/60 hover:bg-ink/5'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
