'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import EventCard from './EventCard';

type Timeframe = 'all' | 'upcoming' | 'past';
type Sort = 'newest' | 'soonest' | 'oldest';

interface RawEvent {
  id: string;
  slug: string;
  title: string;
  shortDescription: string | null;
  startDate: string;
  endDate: string;
  location: string;
  bannerImageUrl: string | null;
}

function SkeletonCard() {
  return (
    <div className="flex flex-col rounded-xl bg-paper border border-ink/10 overflow-hidden animate-pulse">
      <div className="aspect-[16/9] bg-ink/10" />
      <div className="flex flex-col gap-3 p-5">
        <div className="h-3 w-40 rounded bg-ink/10" />
        <div className="h-5 w-full rounded bg-ink/10" />
        <div className="h-3 w-32 rounded bg-ink/10" />
        <div className="space-y-1.5 mt-1">
          <div className="h-3 w-full rounded bg-ink/10" />
          <div className="h-3 w-3/4 rounded bg-ink/10" />
        </div>
        <div className="h-10 w-full rounded-lg bg-ink/10 mt-2" />
      </div>
    </div>
  );
}

export default function PublicEventsList() {
  const [events, setEvents] = useState<RawEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [timeframe, setTimeframe] = useState<Timeframe>('all');
  const [sort, setSort] = useState<Sort>('soonest');

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (timeframe !== 'all') params.set('timeframe', timeframe);
      params.set('sort', sort);

      const res = await fetch(`/api/events?${params.toString()}`, {
        cache: 'no-store',
      });

      if (!res.ok) throw new Error('Failed to load events');

      const data = await res.json();
      setEvents(data.events ?? []);
    } catch {
      setError('Something went wrong loading events. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [search, timeframe, sort]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fetchEvents, 300);
    return () => clearTimeout(debounceRef.current);
  }, [fetchEvents]);

  const timeframeOptions: { value: Timeframe; label: string }[] = [
    { value: 'all', label: 'All Events' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'past', label: 'Past Events' },
  ];

  const sortOptions: { value: Sort; label: string }[] = [
    { value: 'soonest', label: 'Soonest' },
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
            placeholder="Search events by title or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-base pl-10"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex overflow-x-auto rounded-lg border border-ink/10 p-0.5 bg-ink/5">
            {timeframeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTimeframe(opt.value)}
                className={`shrink-0 rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  timeframe === opt.value
                    ? 'bg-paper text-ink shadow-sm'
                    : 'text-ink/50 hover:text-ink'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="input-base w-full min-w-[120px] py-2.5 text-sm sm:w-auto"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="rounded-xl border border-coral/20 bg-coral/5 p-6 text-center">
          <p className="text-coral font-medium">{error}</p>
          <button
            onClick={fetchEvents}
            className="btn-secondary mt-4 text-sm"
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && events.length === 0 && (
        <div className="rounded-xl border border-ink/10 bg-ink/5 p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-ink/10">
            <svg className="h-8 w-8 text-ink/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          </div>
          <h3 className="font-display text-lg font-semibold text-ink">
            {search || timeframe !== 'all'
              ? 'No matching events found'
              : 'No events yet'}
          </h3>
          <p className="mt-1.5 text-sm text-ink/50 max-w-sm mx-auto">
            {search || timeframe !== 'all'
              ? 'Try adjusting your search or filters to find what you are looking for.'
              : 'Check back soon for upcoming family-friendly events in Kenya.'}
          </p>
        </div>
      )}

      {!loading && !error && events.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} {...event} />
          ))}
        </div>
      )}
    </div>
  );
}
