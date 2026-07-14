'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { computeAvailability } from '@/services/ticket-availability';
import { useTicketSelection, type TicketTypeOption } from '@/hooks/useTicketSelection';
import { formatCurrency } from '@/lib/format';

interface TicketTypeData {
  id: string;
  name: string;
  description: string | null;
  price: number;
  capacity: number;
  ticketsSold: number;
}

export default function TicketSelection({
  ticketTypes,
  eventId,
  eventSlug,
}: {
  ticketTypes: TicketTypeData[];
  eventId: string;
  eventSlug: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState<'select' | 'confirm'>('select');
  const [bookingState, setBookingState] = useState<
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'success'; message: string }
    | { status: 'error'; message: string }
  >({ status: 'idle' });

  const options: TicketTypeOption[] = ticketTypes.map((tt) => {
    const { remaining } = computeAvailability(tt.capacity, tt.ticketsSold);
    return { id: tt.id, name: tt.name, price: Number(tt.price), remaining };
  });

  const { quantities, increment, decrement, selectedTypes, totalItems, totalPrice, reset } =
    useTicketSelection(options);

  if (ticketTypes.length === 0) return null;

  const handleConfirmBooking = async () => {
    setBookingState({ status: 'loading' });

    const items = selectedTypes.map((st) => ({
      ticketTypeId: st.id,
      quantity: st.quantity,
    }));

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, items }),
      });

      if (res.status === 401) {
        router.push(`/auth/login?callbackUrl=/events/${eventSlug}`);
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        setBookingState({
          status: 'error',
          message: data.error || 'Something went wrong. Please try again.',
        });
        setStep('select');
        return;
      }

      setBookingState({
        status: 'success',
        message: `Your booking is confirmed! ${totalItems} ${totalItems === 1 ? 'ticket has' : 'tickets have'} been reserved.`,
      });
    } catch {
      setBookingState({
        status: 'error',
        message: 'Something went wrong. Please try again.',
      });
      setStep('select');
    }
  };

  return (
    <div className="mt-8">
      <h2 className="font-display text-xl font-bold text-ink mb-4">Tickets</h2>
      <div className="grid gap-3">
        {ticketTypes.map((tt) => {
          const { remaining, isSoldOut } = computeAvailability(tt.capacity, tt.ticketsSold);
          const qty = quantities[tt.id] ?? 0;

          return (
            <div
              key={tt.id}
              className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border p-4 ${
                isSoldOut
                  ? 'border-ink/10 bg-ink/5'
                  : 'border-coral/10 bg-gradient-to-r from-coral/5 to-sun/5'
              }`}
            >
              <div className="min-w-0 flex-1 w-full sm:w-auto">
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-semibold text-sm text-ink">{tt.name}</h3>
                  {isSoldOut && (
                    <span className="inline-flex items-center rounded-full bg-coral/10 px-2 py-0.5 text-xs font-semibold text-coral ring-1 ring-coral/20">
                      Sold Out
                    </span>
                  )}
                </div>
                {tt.description && (
                  <p className="text-xs text-ink/50 mt-0.5">{tt.description}</p>
                )}
                <p className="text-xs text-ink/40 mt-1">
                  {isSoldOut
                    ? 'No tickets available'
                    : `${remaining} of ${tt.capacity} remaining`}
                </p>
              </div>

              <div className="flex items-center gap-4 shrink-0 w-full sm:w-auto">
                {!isSoldOut && (
                  <div className="flex items-center gap-1.5 rounded-lg bg-paper border border-ink/10">
                    <button
                      type="button"
                      onClick={() => decrement(tt.id)}
                      disabled={qty === 0}
                      className="flex h-8 w-8 items-center justify-center text-ink/60 hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-l-lg"
                      aria-label={`Decrease quantity for ${tt.name}`}
                    >
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                        <path d="M5 12h14" />
                      </svg>
                    </button>
                    <span className="min-w-[2ch] text-center text-sm font-medium text-ink tabular-nums">
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => increment(tt.id)}
                      disabled={qty >= remaining}
                      className="flex h-8 w-8 items-center justify-center text-ink/60 hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-r-lg"
                      aria-label={`Increase quantity for ${tt.name}`}
                    >
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </button>
                  </div>
                )}

                <div className="text-right shrink-0 min-w-[80px]">
                  <p className="font-display font-semibold text-base text-ink">
                    {formatCurrency(Number(tt.price))}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {bookingState.status === 'success' && (
        <div className="mt-4 rounded-xl border border-grass/20 bg-grass/5 p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-grass/10 mb-4">
            <svg className="h-6 w-6 text-grass" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h3 className="font-display font-semibold text-lg text-ink mb-1">Booking Confirmed!</h3>
          <p className="text-sm text-ink/60">{bookingState.message}</p>
        </div>
      )}

      {bookingState.status === 'error' && (
        <div className="mt-4 rounded-xl border border-coral/20 bg-coral/5 p-4 text-sm text-coral">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <path d="M15 9l-6 6M9 9l6 6" />
            </svg>
            <span>{bookingState.message}</span>
          </div>
        </div>
      )}

      {totalItems > 0 && bookingState.status !== 'success' && (
        <div className="mt-4 rounded-xl border border-ink/10 bg-paper p-4 shadow-soft">
          {step === 'select' && (
            <>
              <div className="space-y-2">
                {selectedTypes.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between text-sm">
                    <span className="text-ink/70">
                      {entry.quantity}&times; {entry.name}
                    </span>
                    <span className="font-medium text-ink">{formatCurrency(entry.subtotal)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-ink/10 pt-3">
                <span className="font-display font-semibold text-base text-ink">
                  {totalItems} {totalItems === 1 ? 'ticket' : 'tickets'}
                </span>
                <span className="font-display font-bold text-lg text-ink">
                  {formatCurrency(totalPrice)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setStep('confirm')}
                className="btn-primary mt-4 w-full text-center"
              >
                Review Booking
              </button>
            </>
          )}

          {step === 'confirm' && (
            <>
              <div className="mb-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep('select')}
                  className="text-ink/40 hover:text-ink transition-colors"
                  aria-label="Go back to ticket selection"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                </button>
                <h3 className="font-display font-semibold text-sm text-ink">Confirm your booking</h3>
              </div>

              <div className="rounded-lg bg-ink/[0.03] border border-ink/10 p-3 mb-3">
                <p className="text-xs font-medium text-ink/50 uppercase tracking-wide mb-2">Order Summary</p>
                <div className="space-y-1.5">
                  {selectedTypes.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between text-sm">
                      <span className="text-ink/70">
                        {entry.quantity}&times; {entry.name}
                      </span>
                      <span className="font-medium text-ink">{formatCurrency(entry.subtotal)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-ink/10 pt-3 mb-1">
                <span className="font-display font-semibold text-base text-ink">
                  {totalItems} {totalItems === 1 ? 'ticket' : 'tickets'}
                </span>
                <span className="font-display font-bold text-lg text-ink">
                  {formatCurrency(totalPrice)}
                </span>
              </div>

              <p className="text-xs text-ink/40 mb-3">
                Tickets are non-refundable. You&apos;ll receive a confirmation email with your QR codes.
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('select')}
                  className="btn-secondary flex-1 text-center"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleConfirmBooking}
                  disabled={bookingState.status === 'loading'}
                  className="btn-primary flex-1 text-center"
                >
                  {bookingState.status === 'loading' ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    'Confirm & Book'
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
