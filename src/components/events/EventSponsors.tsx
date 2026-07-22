'use client';

import { useState, useEffect, useCallback } from 'react';

interface LinkedSponsor {
  sponsor: {
    id: string;
    companyName: string;
    logoUrl: string | null;
    tier: string;
    isPublished: boolean;
  };
}

interface AvailableSponsor {
  id: string;
  companyName: string;
  slug: string;
  logoUrl: string | null;
  tier: string;
  isPublished: boolean;
}

interface EventSponsorsProps {
  eventId: string;
}

const TIER_LABELS: Record<string, string> = {
  PLATINUM: 'Platinum',
  GOLD: 'Gold',
  SILVER: 'Silver',
  BRONZE: 'Bronze',
};

const TIER_COLORS: Record<string, string> = {
  PLATINUM: 'bg-purple-50 text-purple-700 border-purple-200',
  GOLD: 'bg-amber-50 text-amber-700 border-amber-200',
  SILVER: 'bg-slate-100 text-slate-600 border-slate-200',
  BRONZE: 'bg-orange-50 text-orange-700 border-orange-200',
};

export default function EventSponsors({ eventId }: EventSponsorsProps) {
  const [linked, setLinked] = useState<LinkedSponsor[]>([]);
  const [available, setAvailable] = useState<AvailableSponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [linkedRes, sponsorsRes] = await Promise.all([
        fetch(`/api/admin/events/${eventId}/sponsors`),
        fetch(`/api/admin/sponsors?status=published&limit=50`),
      ]);

      if (linkedRes.ok) {
        const linkedData = await linkedRes.json();
        setLinked(linkedData);
      }

      if (sponsorsRes.ok) {
        const sponsorsData = await sponsorsRes.json();
        setAvailable(sponsorsData.sponsors ?? []);
      }
    } catch {
      setError('Failed to load sponsors');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const linkedIds = new Set(linked.map((l) => l.sponsor.id));
  const unlinked = available.filter((s) => !linkedIds.has(s.id));

  async function handleAdd() {
    if (!selectedId) return;
    setAdding(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/events/${eventId}/sponsors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sponsorId: selectedId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to link sponsor');
      }

      setSelectedId('');
      await fetchData();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(sponsorId: string) {
    setRemoving(sponsorId);
    setError(null);

    try {
      const res = await fetch(`/api/admin/events/${eventId}/sponsors`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sponsorId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to unlink sponsor');
      }

      await fetchData();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setRemoving(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-5 w-40 bg-ink/5 rounded animate-pulse" />
        <div className="h-10 w-full bg-ink/5 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-display font-semibold text-lg text-ink">Sponsors</h3>
      <p className="text-sm text-ink/50 mt-1">
        Link published sponsors to this event. They will appear on the event detail page.
      </p>

      {error && (
        <div className="mt-3 rounded-lg bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-700">
          {error}
        </div>
      )}

      {linked.length > 0 && (
        <div className="mt-4 space-y-2">
          {linked.map((link) => (
            <div
              key={link.sponsor.id}
              className="flex items-center justify-between rounded-lg border border-ink/10 bg-white px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-coral/10 text-coral font-display font-bold text-sm shrink-0">
                  {link.sponsor.logoUrl ? (
                    <img src={link.sponsor.logoUrl} alt="" className="h-6 w-6 object-contain rounded mix-blend-multiply" />
                  ) : (
                    link.sponsor.companyName.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-ink">{link.sponsor.companyName}</p>
                  <span className={`inline-flex mt-0.5 rounded border px-1.5 py-0.5 text-[10px] font-medium ${TIER_COLORS[link.sponsor.tier] ?? TIER_COLORS.BRONZE}`}>
                    {TIER_LABELS[link.sponsor.tier] ?? link.sponsor.tier}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(link.sponsor.id)}
                disabled={removing === link.sponsor.id}
                className="text-sm text-red-500 hover:text-red-700 disabled:opacity-50 transition-colors"
              >
                {removing === link.sponsor.id ? 'Removing...' : 'Remove'}
              </button>
            </div>
          ))}
        </div>
      )}

      {unlinked.length > 0 && (
        <div className="mt-4 flex items-center gap-2">
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="flex-1 rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm text-ink focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral/20"
          >
            <option value="">Select a sponsor...</option>
            {unlinked.map((sponsor) => (
              <option key={sponsor.id} value={sponsor.id}>
                {sponsor.companyName} ({TIER_LABELS[sponsor.tier] ?? sponsor.tier})
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!selectedId || adding}
            className="rounded-lg bg-coral px-4 py-2 text-sm font-medium text-white hover:bg-coral/90 disabled:opacity-50 transition-colors"
          >
            {adding ? 'Adding...' : 'Add'}
          </button>
        </div>
      )}

      {linked.length === 0 && unlinked.length === 0 && (
        <p className="mt-4 text-sm text-ink/40">
          No published sponsors available. Create sponsors in the{' '}
          <a href="/admin/sponsors" className="text-coral hover:underline">Sponsors</a> section first.
        </p>
      )}
    </div>
  );
}
