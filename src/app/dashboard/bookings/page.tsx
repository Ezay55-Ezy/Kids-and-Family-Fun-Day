import Link from 'next/link';
import { auth } from '@/auth';
import { getUserBookings } from '@/services/dashboard-service';
import CancelBookingButton from '@/components/bookings/CancelBookingButton';
import TicketQR from '@/components/bookings/TicketQR';
import { formatDate, formatCurrency } from '@/lib/format';

export const metadata = {
  title: 'My Bookings',
  description: 'View your booking history',
};

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    REQUESTED: { bg: 'bg-sun/10', text: 'text-amber-700', label: 'Pending' },
    CONFIRMED: { bg: 'bg-grass/10', text: 'text-grass', label: 'Confirmed' },
    DECLINED: { bg: 'bg-coral/10', text: 'text-coral', label: 'Declined' },
    COMPLETED: { bg: 'bg-sky/10', text: 'text-sky', label: 'Completed' },
    CANCELLED: { bg: 'bg-ink/5', text: 'text-ink/50', label: 'Cancelled' },
  };

  const s = map[status] ?? { bg: 'bg-ink/5', text: 'text-ink/50', label: status };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}

export default async function BookingsPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const bookings = await getUserBookings(userId);

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink">My Bookings</h2>
        <p className="text-ink/60 mt-1">View your booking history and ticket purchases.</p>
      </div>

      {bookings.length === 0 ? (
        <div className="rounded-xl border border-ink/10 bg-paper p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sky/10">
            <svg className="h-8 w-8 text-sky" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          </div>
          <h3 className="font-display text-lg font-semibold text-ink">No bookings yet</h3>
          <p className="text-ink/60 mt-2 max-w-sm mx-auto">
            You haven&apos;t booked any tickets yet. Browse events to get started.
          </p>
          <Link href="/events" className="btn-primary mt-6 inline-flex items-center gap-2">
            Browse events
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const isCancelled = booking.status === 'CANCELLED';

            return (
              <div
                key={booking.id}
                className={`rounded-xl border bg-paper shadow-soft transition-shadow hover:shadow-soft-lg ${
                  isCancelled ? 'border-ink/5 opacity-60' : 'border-ink/10'
                }`}
              >
                <div className={`flex items-start justify-between gap-4 p-6 pb-4 border-b ${
                  isCancelled ? 'border-ink/5' : 'border-ink/5'
                }`}>
                  <div className="min-w-0">
                    <Link
                      href={`/events/${booking.event?.slug ?? '#'}`}
                      className={`font-display text-lg font-semibold transition-colors ${
                        isCancelled
                          ? 'text-ink/50 line-through pointer-events-none'
                          : 'text-ink hover:text-coral'
                      }`}
                    >
                      {booking.event?.title ?? '(Unknown event)'}
                    </Link>
                    {booking.event && (
                      <p className={`text-sm mt-1 ${
                        isCancelled ? 'text-ink/40' : 'text-ink/60'
                      }`}>
                        {formatDate(booking.event.startDate)} &middot; {booking.event.location}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <StatusBadge status={booking.status} />
                    <span className={`font-display text-lg font-bold ${
                      isCancelled ? 'text-ink/40' : 'text-ink'
                    }`}>
                      {formatCurrency(booking.totalAmount)}
                    </span>
                  </div>
                </div>

                <div className={`p-6 pt-4 ${isCancelled ? 'opacity-50' : ''}`}>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-ink/40 text-xs uppercase tracking-wider">
                        <th className="text-left pb-2 font-medium">Ticket type</th>
                        <th className="text-center pb-2 font-medium">Qty</th>
                        <th className="text-right pb-2 font-medium">Price</th>
                        <th className="text-right pb-2 font-medium">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {booking.items.map((item) => (
                        <tr key={item.id} className="border-t border-ink/5">
                          <td className={`py-2.5 font-medium ${isCancelled ? 'text-ink/50' : 'text-ink'}`}>{item.ticketTypeName}</td>
                          <td className="py-2.5 text-center text-ink/70">&times;{item.quantity}</td>
                          <td className="py-2.5 text-right text-ink/70">{formatCurrency(item.unitPrice)}</td>
                          <td className={`py-2.5 text-right font-semibold ${isCancelled ? 'text-ink/50' : 'text-ink'}`}>{formatCurrency(item.subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {!isCancelled && booking.event && (
                  <div className="px-6 pb-2">
                    <TicketQR
                      ticketCode={booking.ticketCode}
                      eventTitle={booking.event.title}
                      eventDate={formatDate(booking.event.startDate)}
                      eventLocation={booking.event.location}
                    />
                  </div>
                )}

                <div className="px-6 pb-4 flex items-center justify-between">
                  <span className="text-xs text-ink/40">
                    Booked on {formatDate(booking.createdAt)} &middot; Ref: {booking.id.slice(0, 8)}
                  </span>
                  {booking.canCancel && (
                    <CancelBookingButton bookingId={booking.id} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
