'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatDate } from '@/lib/format';

interface Subscriber {
  id: string;
  email: string;
  subscribedAt: string;
  isActive: boolean;
}

interface SubscriberStats {
  total: number;
  active: number;
  inactive: number;
  recent30Days: number;
  recent7Days: number;
}

export default function AdminNewsletterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [stats, setStats] = useState<SubscriberStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const currentStatus = searchParams.get('status') || '';
  const currentSearch = searchParams.get('query') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const fetchSubscribers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (currentStatus) params.set('status', currentStatus);
      if (currentSearch) params.set('query', currentSearch);
      params.set('page', String(currentPage));
      params.set('limit', '10');

      const res = await fetch(`/api/admin/newsletter?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setSubscribers(data.subscribers);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setStats(data.stats);
    } catch {
      setError('Failed to load subscribers');
    } finally {
      setLoading(false);
    }
  }, [currentStatus, currentSearch, currentPage]);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page');
    router.push(`?${params.toString()}`);
  }

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = (formData.get('query') as string) || '';
    updateParam('query', query);
  }

  async function handleDelete(subscriberId: string, email: string) {
    if (!confirm(`Remove subscriber "${email}"?`)) return;
    setDeletingId(subscriberId);
    try {
      const res = await fetch(`/api/admin/newsletter/${subscriberId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      fetchSubscribers();
    } catch {
      setError('Failed to delete subscriber');
    } finally {
      setDeletingId(null);
    }
  }

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch('/api/admin/newsletter/export');
      if (!res.ok) throw new Error('Failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('Failed to export');
    } finally {
      setExporting(false);
    }
  }

  const filterTabs = [
    { label: 'All', value: '' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Newsletter Subscribers</h1>
          <p className="mt-1 font-body text-ink/60">Manage email subscribers and exports</p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting || total === 0}
          className="rounded-lg border border-ink/10 bg-paper px-4 py-2 text-sm font-medium text-ink hover:bg-ink/5 disabled:opacity-50"
        >
          {exporting ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-ink/5 bg-paper p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-ink/50">Total Subscribers</p>
            <p className="mt-1 text-2xl font-bold text-ink">{stats.total}</p>
          </div>
          <div className="rounded-xl border border-ink/5 bg-paper p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-ink/50">Active</p>
            <p className="mt-1 text-2xl font-bold text-grass">{stats.active}</p>
          </div>
          <div className="rounded-xl border border-ink/5 bg-paper p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-ink/50">Last 7 Days</p>
            <p className="mt-1 text-2xl font-bold text-sky">{stats.recent7Days}</p>
          </div>
          <div className="rounded-xl border border-ink/5 bg-paper p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-ink/50">Last 30 Days</p>
            <p className="mt-1 text-2xl font-bold text-sun">{stats.recent30Days}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 rounded-lg bg-ink/5 p-1">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => updateParam('status', tab.value)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                currentStatus === tab.value
                  ? 'bg-paper text-ink shadow-sm'
                  : 'text-ink/60 hover:text-ink'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            name="query"
            defaultValue={currentSearch}
            placeholder="Search by email..."
            className="rounded-lg border border-ink/10 bg-paper px-3 py-1.5 text-sm text-ink placeholder:text-ink/40 focus:border-sky focus:outline-none focus:ring-1 focus:ring-sky"
          />
          <button type="submit" className="rounded-lg bg-ink px-3 py-1.5 text-sm font-medium text-white hover:bg-ink/90">
            Search
          </button>
        </form>
      </div>

      {error && (
        <div className="rounded-lg bg-coral/10 p-3 text-sm text-coral">{error}</div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-ink/5" />
          ))}
        </div>
      ) : subscribers.length === 0 ? (
        <div className="rounded-xl border border-ink/5 bg-paper p-12 text-center">
          <p className="text-ink/40">No subscribers found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {subscribers.map((sub) => (
            <div
              key={sub.id}
              className="flex items-center justify-between rounded-xl border border-ink/5 bg-paper p-4 transition-colors hover:border-sky/20 hover:bg-sky/5"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky/10 text-sm font-bold text-sky">
                  {sub.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-ink">{sub.email}</p>
                  <p className="text-sm text-ink/50">Subscribed {formatDate(sub.subscribedAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                  sub.isActive
                    ? 'bg-grass/10 text-grass ring-grass/20'
                    : 'bg-coral/10 text-coral ring-coral/20'
                }`}>
                  {sub.isActive ? 'Active' : 'Inactive'}
                </span>
                <button
                  onClick={() => handleDelete(sub.id, sub.email)}
                  disabled={deletingId === sub.id}
                  className="rounded-lg bg-coral/5 px-3 py-1.5 text-xs font-medium text-coral/60 hover:bg-coral/10 disabled:opacity-50"
                >
                  {deletingId === sub.id ? '...' : 'Remove'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-ink/50">
            Showing {((currentPage - 1) * 10) + 1}–{Math.min(currentPage * 10, total)} of {total}
          </p>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => updateParam('page', page === 1 ? '' : String(page))}
                className={`rounded-md px-3 py-1 text-sm font-medium ${
                  page === currentPage ? 'bg-ink text-white' : 'text-ink/60 hover:bg-ink/5'
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
