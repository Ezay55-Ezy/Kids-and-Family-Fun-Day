'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CancelBookingButtonProps {
  bookingId: string;
}

export default function CancelBookingButton({ bookingId }: CancelBookingButtonProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleCancel = async () => {
    setCancelling(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        setDone(true);
        setConfirming(false);
        router.refresh();
      } else {
        const body = await res.json();
        setError(body.error ?? 'Failed to cancel booking.');
        setConfirming(false);
      }
    } catch {
      setError('Something went wrong. Please try again.');
      setConfirming(false);
    } finally {
      setCancelling(false);
    }
  };

  if (done) {
    return null;
  }

  if (error) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-coral">{error}</span>
        <button
          type="button"
          onClick={() => setError(null)}
          className="text-xs font-medium text-ink/50 hover:text-ink"
        >
          Dismiss
        </button>
      </div>
    );
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-ink/60">Cancel this booking?</span>
        <button
          type="button"
          onClick={handleCancel}
          disabled={cancelling}
          className="text-xs font-medium text-paper bg-coral rounded px-2 py-1 hover:bg-coral/90 disabled:opacity-50"
        >
          {cancelling ? '...' : 'Yes, cancel'}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="text-xs font-medium text-ink/50 hover:text-ink"
        >
          Keep
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="text-xs font-medium text-coral hover:text-coral/80 transition-colors"
    >
      Cancel booking
    </button>
  );
}
