'use client';

import { useState, useEffect } from 'react';

interface TicketQRProps {
  ticketCode: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
}

export default function TicketQR({ ticketCode, eventTitle, eventDate, eventLocation }: TicketQRProps) {
  const [open, setOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || qrDataUrl) return;
    setLoading(true);
    import('qrcode').then((QRCode) => {
      QRCode.toDataURL(ticketCode, {
        width: 300,
        margin: 2,
        color: { dark: '#1C1917', light: '#FFFFFF' },
      }).then((url: string) => {
        setQrDataUrl(url);
        setLoading(false);
      });
    });
  }, [open, ticketCode, qrDataUrl]);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="text-xs font-medium text-sky hover:text-sky/80 transition-colors"
      >
        {open ? 'Hide ticket' : 'View ticket'}
      </button>

      {open && (
        <div className="mt-4 rounded-xl border border-ink/10 bg-paper p-6">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky border-t-transparent" />
            </div>
          )}
          {qrDataUrl && (
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
              <img
                src={qrDataUrl}
                alt={`QR code for ${eventTitle}`}
                className="h-48 w-48 shrink-0 rounded-lg border border-ink/10"
              />
              <div className="min-w-0 space-y-2 text-center sm:text-left">
                <h4 className="font-display font-semibold text-ink">{eventTitle}</h4>
                <p className="text-sm text-ink/60">{eventDate}</p>
                <p className="text-sm text-ink/60">{eventLocation}</p>
                <div className="pt-2">
                  <p className="text-xs text-ink/40 font-mono tracking-wider">{ticketCode}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
