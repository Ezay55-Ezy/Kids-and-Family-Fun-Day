'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDateWithWeekday, formatTime } from '@/lib/format';

interface TicketCardItem {
  ticketTypeName: string;
  quantity: number;
}

interface TicketCardProps {
  bookingId: string;
  ticketCode: string;
  checkinUrl: string;
  eventTitle: string;
  eventSlug: string;
  eventDate: string;
  eventLocation: string;
  items: TicketCardItem[];
}

export default function TicketCard({
  ticketCode,
  checkinUrl,
  eventTitle,
  eventSlug,
  eventDate,
  eventLocation,
  items,
}: TicketCardProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    import('qrcode').then((QRCode) => {
      QRCode.toDataURL(checkinUrl, {
        width: 280,
        margin: 2,
        color: { dark: '#1C1917', light: '#FFFFFF' },
      }).then((url: string) => {
        if (!cancelled) setQrDataUrl(url);
      });
    });
    return () => { cancelled = true; };
  }, [checkinUrl]);

  const ticketTypes = items.map((i) =>
    i.quantity > 1 ? `${i.quantity}x ${i.ticketTypeName}` : i.ticketTypeName,
  ).join(', ');

  return (
    <div className="rounded-xl border border-ink/10 bg-paper shadow-soft overflow-hidden">
      {/* Accent bar */}
      <div className="h-2 bg-gradient-to-r from-coral to-sun" />

      <div className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-5 sm:gap-6">
          {/* QR section */}
          <div className="shrink-0 flex justify-center">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`QR code for ${eventTitle}`}
                className="h-40 w-40 rounded-lg border border-ink/10"
              />
            ) : (
              <div className="flex h-40 w-40 items-center justify-center rounded-lg bg-ink/5">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-sky border-t-transparent" />
              </div>
            )}
          </div>

          {/* Details section */}
          <div className="flex-1 min-w-0 space-y-3">
            <div>
              <Link
                href={`/events/${eventSlug}`}
                className="font-display text-lg font-bold text-ink hover:text-coral transition-colors"
              >
                {eventTitle}
              </Link>
              <p className="text-sm text-ink/60 mt-0.5">
                {formatDateWithWeekday(eventDate)} at {formatTime(eventDate)}
              </p>
              <p className="text-sm text-ink/60">{eventLocation}</p>
            </div>

            <div className="border-t border-ink/5 pt-3">
              <p className="text-xs text-ink/40 uppercase tracking-wider font-medium mb-1.5">
                Tickets
              </p>
              <div className="flex flex-wrap gap-1.5">
                {items.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center rounded-full bg-sky/10 px-2.5 py-0.5 text-xs font-medium text-sky"
                  >
                    {item.quantity > 1 ? `${item.quantity}\u00d7 ` : ''}{item.ticketTypeName}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Perforated-style divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t-2 border-dashed border-ink/10" />
          </div>
        </div>

        {/* Ticket code footer */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-ink/40 font-mono tracking-wider">
            {ticketCode}
          </span>
          <span className="text-[10px] text-ink/30 uppercase tracking-widest">
            Digital Ticket
          </span>
        </div>
      </div>
    </div>
  );
}
