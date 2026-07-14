import Link from 'next/link';
import { auth } from '@/auth';
import { getUserWallet } from '@/services/dashboard-service';
import TicketCard from '@/components/bookings/TicketCard';

export const metadata = {
  title: 'My Tickets',
  description: 'Your digital ticket wallet',
};

export default async function TicketsPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const tickets = await getUserWallet(userId);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink">My Tickets</h2>
        <p className="text-ink/60 mt-1">
          Your active digital tickets — show this at the event entrance.
        </p>
      </div>

      {tickets.length === 0 ? (
        <div className="rounded-xl border border-ink/10 bg-paper p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-coral/10">
            <svg className="h-8 w-8 text-coral" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
              <path d="M9 9h.01" />
            </svg>
          </div>
          <h3 className="font-display text-lg font-semibold text-ink">No active tickets</h3>
          <p className="text-ink/60 mt-2 max-w-sm mx-auto">
            You don&apos;t have any active tickets. Browse events and book your spot.
          </p>
          <Link href="/events" className="btn-primary mt-6 inline-flex items-center gap-2">
            Browse events
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {tickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              bookingId={ticket.id}
              ticketCode={ticket.ticketCode}
              checkinUrl={ticket.checkinUrl}
              eventTitle={ticket.event.title}
              eventSlug={ticket.event.slug}
              eventDate={ticket.event.startDate}
              eventLocation={ticket.event.location}
              items={ticket.items}
            />
          ))}
        </div>
      )}
    </div>
  );
}
