'use client';

export interface EventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  status: 'published' | 'sold_out' | 'draft';
}

interface UpcomingEventsProps {
  events?: EventItem[];
}

const placeholderEvents: EventItem[] = [
  {
    id: '1',
    title: 'Kids & Family Fun Day',
    date: 'Dec 25, 2026',
    time: '08:00 AM',
    location: 'Nairobi, Kenya',
    status: 'published',
  },
  {
    id: '2',
    title: 'Family Sports Tournament',
    date: 'Jan 15, 2027',
    time: '09:00 AM',
    location: 'Mombasa, Kenya',
    status: 'draft',
  },
  {
    id: '3',
    title: 'Art & Craft Workshop',
    date: 'Feb 5, 2027',
    time: '10:00 AM',
    location: 'Nakuru, Kenya',
    status: 'published',
  },
];

const statusStyles: Record<EventItem['status'], string> = {
  published: 'bg-grass/10 text-grass ring-grass/20',
  sold_out: 'bg-coral/10 text-coral ring-coral/20',
  draft: 'bg-sun/10 text-sun ring-sun/20',
};

const statusLabels: Record<EventItem['status'], string> = {
  published: 'Published',
  sold_out: 'Sold Out',
  draft: 'Draft',
};

export default function UpcomingEvents({ events }: UpcomingEventsProps) {
  const displayEvents = events && events.length > 0 ? events : placeholderEvents;

  return (
    <div className="rounded-xl bg-paper border border-ink/10 shadow-soft">
      <div className="px-6 py-4 border-b border-ink/10">
        <h2 className="font-display font-semibold text-lg text-ink">Upcoming Events</h2>
      </div>
      <div className="divide-y divide-ink/5">
        {displayEvents.map((event) => (
          <div key={event.id} className="flex items-center justify-between px-6 py-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ink">{event.title}</p>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-ink/50">
                <span className="flex items-center gap-1">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                  {event.date}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                  {event.time}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {event.location}
                </span>
              </div>
            </div>
            <span className={`shrink-0 ml-4 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${statusStyles[event.status]}`}>
              {statusLabels[event.status]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
