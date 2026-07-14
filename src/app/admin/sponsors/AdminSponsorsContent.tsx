'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatDate } from '@/lib/format';

interface SponsorItem {
  id: string;
  companyName: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  websiteUrl: string | null;
  tier: string;
  displayOrder: number;
  isPublished: boolean;
  userId: string | null;
  createdAt: string;
  _count: { events: number };
}

interface SponsorStats {
  total: number;
  published: number;
  draft: number;
  byTier: Array<{ tier: string; count: number }>;
}

const tierStyles: Record<string, string> = {
  PLATINUM: 'bg-ink/10 text-ink ring-ink/20',
  GOLD: 'bg-sun/10 text-sun ring-sun/20',
  SILVER: 'bg-ink/20 text-ink ring-ink/30',
  BRONZE: 'bg-[#CD7F32]/10 text-[#CD7F32] ring-[#CD7F32]/20',
};

const filterTabs = [
  { label: 'All', value: '' },
  { label: 'Published', value: 'published' },
  { label: 'Draft', value: 'draft' },
];

export default function AdminSponsorsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sponsors, setSponsors] = useState<SponsorItem[]>([]);
  const [stats, setStats] = useState<SponsorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const currentStatus = searchParams.get('status') || '';
  const currentSearch = searchParams.get('query') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const fetchSponsors = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (currentStatus) params.set('status', currentStatus);
      if (currentSearch) params.set('query', currentSearch);
      params.set('page', String(currentPage));
      params.set('limit', '10');

      const res = await fetch(`/api/admin/sponsors?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setSponsors(data.sponsors);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setStats(data.stats);
    } catch {
      setError('Failed to load sponsors');
    } finally {
      setLoading(false);
    }
  }, [currentStatus, currentSearch, currentPage]);

  useEffect(() => {
    fetchSponsors();
  }, [fetchSponsors]);

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

  async function handleTogglePublish(sponsorId: string) {
    setTogglingId(sponsorId);
    try {
      const res = await fetch(`/api/admin/sponsors/${sponsorId}/publish`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed');
      setSponsors((prev) =>
        prev.map((s) => (s.id === sponsorId ? { ...s, isPublished: !s.isPublished } : s))
      );
    } catch {
      setError('Failed to toggle publish status');
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(sponsorId: string, name: string) {
    if (!confirm(`Delete sponsor "${name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/sponsors/${sponsorId}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      fetchSponsors();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Sponsor Management</h1>
          <p className="mt-1 font-body text-ink/60">Manage sponsor profiles and display settings</p>
        </div>
        <Link
          href="/admin/sponsors/new"
          className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-ink/90"
        >
          + New Sponsor
        </Link>
      </div>

      {stats && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-ink/5 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-ink/50">Total Sponsors</p>
            <p className="mt-1 text-2xl font-bold text-ink">{stats.total}</p>
          </div>
          <div className="rounded-xl border border-ink/5 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-ink/50">Published</p>
            <p className="mt-1 text-2xl font-bold text-grass">{stats.published}</p>
          </div>
          <div className="rounded-xl border border-ink/5 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-ink/50">Draft</p>
            <p className="mt-1 text-2xl font-bold text-sun">{stats.draft}</p>
          </div>
          <div className="rounded-xl border border-ink/5 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-ink/50">Gold+</p>
            <p className="mt-1 text-2xl font-bold text-sun">
              {(stats.byTier.find((t) => t.tier === 'PLATINUM')?.count || 0) + (stats.byTier.find((t) => t.tier === 'GOLD')?.count || 0)}
            </p>
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
                  ? 'bg-white text-ink shadow-sm'
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
            placeholder="Search sponsors..."
            className="rounded-lg border border-ink/10 bg-white px-3 py-1.5 text-sm text-ink placeholder:text-ink/40 focus:border-sky focus:outline-none focus:ring-1 focus:ring-sky"
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
            <div key={i} className="h-20 animate-pulse rounded-xl bg-ink/5" />
          ))}
        </div>
      ) : sponsors.length === 0 ? (
        <div className="rounded-xl border border-ink/5 bg-white p-12 text-center">
          <p className="text-ink/40">No sponsors found</p>
          <Link href="/admin/sponsors/new" className="mt-3 inline-block text-sm text-sky hover:underline">
            Create your first sponsor
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {sponsors.map((sponsor) => (
            <div
              key={sponsor.id}
              className="flex items-center justify-between rounded-xl border border-ink/5 bg-white p-4 transition-colors hover:border-sky/20 hover:bg-sky/5"
            >
              <div className="flex items-center gap-4">
                {sponsor.logoUrl ? (
                  <img src={sponsor.logoUrl} alt="" className="h-10 w-10 rounded-lg object-contain" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink/10 text-sm font-bold text-ink/60">
                    {sponsor.companyName.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/sponsors/${sponsor.id}`} className="font-medium text-ink hover:text-sky">
                      {sponsor.companyName}
                    </Link>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${tierStyles[sponsor.tier] || ''}`}>
                      {sponsor.tier}
                    </span>
                    {!sponsor.isPublished && (
                      <span className="inline-flex items-center rounded-full bg-ink/5 px-2 py-0.5 text-xs font-medium text-ink/50 ring-1 ring-inset ring-ink/10">
                        Draft
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-ink/50">
                    {sponsor.description ? sponsor.description.slice(0, 80) + (sponsor.description.length > 80 ? '...' : '') : 'No description'}
                    {' · '}{sponsor._count.events} events · Order #{sponsor.displayOrder}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleTogglePublish(sponsor.id)}
                  disabled={togglingId === sponsor.id}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    sponsor.isPublished
                      ? 'bg-grass/10 text-grass hover:bg-grass/20'
                      : 'bg-ink/5 text-ink/50 hover:bg-ink/10'
                  } disabled:opacity-50`}
                >
                  {togglingId === sponsor.id ? '...' : sponsor.isPublished ? 'Published' : 'Unpublished'}
                </button>
                <Link
                  href={`/admin/sponsors/${sponsor.id}`}
                  className="rounded-lg bg-ink/5 px-3 py-1.5 text-xs font-medium text-ink/60 hover:bg-ink/10"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(sponsor.id, sponsor.companyName)}
                  className="rounded-lg bg-coral/5 px-3 py-1.5 text-xs font-medium text-coral/60 hover:bg-coral/10"
                >
                  Delete
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
