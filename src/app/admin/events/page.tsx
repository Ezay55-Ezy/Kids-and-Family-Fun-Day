import Link from 'next/link';
import EventList from '@/components/events/EventList';

export const metadata = {
  title: 'Events',
  description: 'Manage events',
};

export default async function EventsPage() {
  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink">Events</h2>
          <p className="text-ink/60 mt-1">Create and manage events.</p>
        </div>
        <Link href="/admin/events/new" className="btn-primary">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New event
        </Link>
      </div>

      <EventList />
    </div>
  );
}
