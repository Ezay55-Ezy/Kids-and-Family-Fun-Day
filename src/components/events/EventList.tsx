'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/format';

interface EventCategory {
  id: string;
  name: string;
  slug: string;
}

interface EventCreator {
  id: string;
  name: string;
  email: string;
}

interface EventItem {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
  location: string;
  bannerImageUrl: string | null;
  capacity: number;
  ticketsSold: number;
  createdAt: string;
  category: EventCategory | null;
  createdBy: EventCreator;
}

const statusStyles: Record<string, string> = {
  DRAFT: 'bg-sun/10 text-sun ring-sun/20',
  PUBLISHED: 'bg-grass/10 text-grass ring-grass/20',
  SOLD_OUT: 'bg-coral/10 text-coral ring-coral/20',
  CANCELLED: 'bg-ink/10 text-ink/50 ring-ink/20',
  COMPLETED: 'bg-sky/10 text-sky ring-sky/20',
};

const statusLabels: Record<string, string> = {
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  SOLD_OUT: 'Sold Out',
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed',
};

function DeleteButton({ eventId, onDeleted }: { eventId: string; onDeleted: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/events/${eventId}`, { method: 'DELETE' });
      if (res.ok) {
        onDeleted();
      }
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  };

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="text-xs font-medium text-paper bg-coral rounded px-2 py-1 hover:bg-coral/90 disabled:opacity-50"
        >
          {deleting ? '...' : 'Confirm'}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="text-xs font-medium text-ink/50 hover:text-ink"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="text-xs font-medium text-coral hover:text-coral/80"
    >
      Delete
    </button>
  );
}

function StatusToggle({ eventId, status, onToggled }: { eventId: string; status: string; onToggled: () => void }) {
  const [toggling, setToggling] = useState(false);

  const newStatus = status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';

  const handleToggle = async () => {
    setToggling(true);
    try {
      await fetch(`/api/admin/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      onToggled();
    } finally {
      setToggling(false);
    }
  };

  if (status === 'DRAFT' || status === 'PUBLISHED') {
    return (
      <button
        type="button"
        onClick={handleToggle}
        disabled={toggling}
        className="text-xs font-medium text-ink/50 hover:text-ink transition-colors disabled:opacity-50"
      >
        {status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
      </button>
    );
  }

  return null;
}

export default function EventList() {
  const router = useRouter();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/events');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setEvents(data.events);
    } catch {
      setError('Failed to load events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-xl bg-ink/5 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-coral/10 border border-coral/20 p-4 text-sm text-coral">
        {error}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="rounded-xl bg-paper border border-ink/10 p-12 text-center">
        <svg className="h-12 w-12 mx-auto text-ink/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
        <h3 className="mt-4 font-display font-semibold text-lg text-ink">No events yet</h3>
        <p className="mt-1 text-sm text-ink/50">Create your first event to get started.</p>
        <Link
          href="/admin/events/new"
          className="btn-primary mt-6 inline-flex"
        >
          Create event
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div
          key={event.id}
          className="rounded-xl bg-paper border border-ink/10 shadow-soft overflow-hidden"
        >
          <div className="flex items-center gap-4 p-4 md:p-6">
            <div className="h-14 w-14 md:h-16 md:w-16 shrink-0 rounded-lg bg-ink/5 overflow-hidden">
              {event.bannerImageUrl ? (
                <img
                  src={event.bannerImageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-ink/20">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-display font-semibold text-base text-ink truncate">
                  {event.title}
                </h3>
                <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${statusStyles[event.status] || ''}`}>
                  {statusLabels[event.status] || event.status}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-ink/50">
                <span>{formatDate(event.startDate)}</span>
                <span>{event.location}</span>
                <span>Capacity: {event.capacity}</span>
                <span>Created {formatDate(event.createdAt)}</span>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-3 shrink-0">
              <Link
                href={`/admin/events/${event.id}/edit`}
                className="text-xs font-medium text-ink/50 hover:text-ink transition-colors"
              >
                Edit
              </Link>
              <StatusToggle eventId={event.id} status={event.status} onToggled={fetchEvents} />
              <DeleteButton eventId={event.id} onDeleted={fetchEvents} />
            </div>
          </div>

          <div className="flex md:hidden items-center gap-3 px-4 pb-4 pt-0 border-t border-ink/5">
            <Link
              href={`/admin/events/${event.id}/edit`}
              className="text-xs font-medium text-ink/50 hover:text-ink transition-colors"
            >
              Edit
            </Link>
            <StatusToggle eventId={event.id} status={event.status} onToggled={fetchEvents} />
            <DeleteButton eventId={event.id} onDeleted={fetchEvents} />
          </div>
        </div>
      ))}
    </div>
  );
}
