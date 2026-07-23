'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Html5Qrcode } from 'html5-qrcode';

type ScanState = 'idle' | 'scanning' | 'processing' | 'result';

interface ScanOutcome {
  result: 'VALID' | 'ALREADY_CHECKED_IN' | 'CANCELLED' | 'NOT_FOUND';
  booking?: {
    id: string;
    ticketCode: string;
    eventTitle: string;
    attendeeName: string;
    checkedInAt: string | null;
  };
}

function extractTicketCode(data: string): string | null {
  const trimmed = data.trim();

  try {
    const url = new URL(trimmed);
    const parts = url.pathname.split('/');
    const last = parts[parts.length - 1];
    if (last && last.startsWith('TKT-')) return last;
  } catch {
    // not a URL
  }

  if (/^TKT-[A-F0-9]+$/i.test(trimmed)) return trimmed;
  return null;
}

const SCAN_CONFIG = { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 };
const CAMERA_SRC = { facingMode: 'environment' as const };

export default function ScanPage() {
  const router = useRouter();
  const scannerDivRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<Html5Qrcode | null>(null);
  const restartTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [state, setState] = useState<ScanState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<ScanOutcome | null>(null);
  const [count, setCount] = useState(0);
  const [cameraReady, setCameraReady] = useState(false);

  const processCode = useCallback(async (ticketCode: string) => {
    setState('processing');
    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketCode }),
      });
      if (res.status === 401) {
        router.push('/auth/login?callbackUrl=/scan');
        return;
      }
      if (!res.ok) {
        setError('Network error. Try again.');
        setState('idle');
        return;
      }
      const data: ScanOutcome = await res.json();
      setOutcome(data);
      setCount((c) => c + 1);
      setState('result');
      restartTimer.current = setTimeout(() => {
        setOutcome(null);
        setState('scanning');
      }, 3500);
    } catch {
      setError('Connection error. Check your network.');
      setState('idle');
    }
  }, [router]);

  const handleDecoded = useCallback((decodedText: string) => {
    const code = extractTicketCode(decodedText);
    if (!code) return;
    qrRef.current?.stop().catch(() => {});
    processCode(code);
  }, [processCode]);

  const startScanner = useCallback(async () => {
    const qr = qrRef.current;
    if (!qr) return;
    try {
      await qr.start(CAMERA_SRC, SCAN_CONFIG, handleDecoded, () => {});
      setCameraReady(true);
      setState('scanning');
    } catch {
      setError('Could not start camera. Make sure you have granted camera access.');
    }
  }, [handleDecoded]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!scannerDivRef.current) return;
      const { Html5Qrcode } = await import('html5-qrcode');
      if (!mounted) return;
      const qr = new Html5Qrcode('qr-reader');
      qrRef.current = qr;
      await qr.start(CAMERA_SRC, SCAN_CONFIG, handleDecoded, () => {});
      if (mounted) {
        setCameraReady(true);
        setState('scanning');
      }
    })().catch((err) => {
      if (mounted) {
        setError(
          err?.message?.includes('Permission')
            ? 'Camera access denied. Allow camera permission and reload.'
            : 'Could not start camera. Make sure you are on HTTPS and have granted camera access.',
        );
      }
    });

    return () => {
      mounted = false;
      if (restartTimer.current) clearTimeout(restartTimer.current);
      qrRef.current?.stop().catch(() => {});
      qrRef.current?.clear();
    };
  }, [handleDecoded]);

  const restart = useCallback(async () => {
    if (restartTimer.current) clearTimeout(restartTimer.current);
    setOutcome(null);
    setError(null);
    setState('idle');
    await startScanner();
  }, [startScanner]);

  const bgClass =
    outcome?.result === 'VALID'
      ? 'bg-grass'
      : outcome?.result === 'ALREADY_CHECKED_IN'
        ? 'bg-sun'
        : 'bg-coral';

  return (
    <div className="min-h-dvh bg-ink flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 bg-ink border-b border-paper/10">
        <button type="button" onClick={() => router.push('/admin')} className="text-paper/60 hover:text-paper text-sm transition-colors">
          &larr; Back
        </button>
        <h1 className="font-display text-sm font-semibold text-paper tracking-wide">Ticket Scanner</h1>
        <span className="text-xs text-paper/40 tabular-nums">{count} scanned</span>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center relative">
        {state !== 'result' && (
          <div className="relative w-full max-w-md aspect-square">
            <div id="qr-reader" ref={scannerDivRef} className="w-full h-full [& video]:!w-full [& video]:!h-full [& video]:!object-cover" />

            {state === 'scanning' && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-paper/5" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56">
                  <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-coral rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-coral rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-coral rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-coral rounded-br-lg" />
                  <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-coral/60 animate-pulse -translate-y-1/2" />
                </div>
              </div>
            )}

            {state === 'processing' && (
              <div className="absolute inset-0 bg-ink/80 flex items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-coral border-t-transparent" />
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="absolute inset-x-0 top-0 p-4">
            <div className="mx-auto max-w-md rounded-xl bg-coral/10 border border-coral/20 px-4 py-3 text-sm text-coral">
              <p>{error}</p>
              <button type="button" onClick={() => { setError(null); restart(); }} className="mt-2 text-xs font-medium underline text-coral/80 hover:text-coral">
                Try again
              </button>
            </div>
          </div>
        )}

        {state === 'result' && outcome && (
          <div className={`absolute inset-0 ${bgClass} flex items-center justify-center p-6`}>
            <div className="text-center text-paper">
              <div className="mb-6">
                {outcome.result === 'VALID' ? (
                  <svg className="w-16 h-16 text-paper mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                ) : (
                  <svg className="w-16 h-16 text-paper mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                )}
              </div>

              <h2 className="font-display text-3xl font-bold mb-2">
                {outcome.result === 'VALID' && 'Valid \u2014 Checked In'}
                {outcome.result === 'ALREADY_CHECKED_IN' && 'Already Checked In'}
                {outcome.result === 'CANCELLED' && 'Cancelled \u2014 Invalid'}
                {outcome.result === 'NOT_FOUND' && 'Not a Valid Ticket'}
              </h2>

              {outcome.booking && (
                <div className="mt-4 space-y-1">
                  <p className="text-xl font-medium text-paper/90">{outcome.booking.attendeeName}</p>
                  <p className="text-base text-paper/70">{outcome.booking.eventTitle}</p>
                  <p className="text-sm text-paper/50 font-mono mt-2">{outcome.booking.ticketCode}</p>
                </div>
              )}

              {outcome.result === 'ALREADY_CHECKED_IN' && outcome.booking?.checkedInAt && (
                <p className="text-sm text-paper/50 mt-3">
                  First checked in at {new Date(outcome.booking.checkedInAt).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}

              {outcome.result === 'VALID' && (
                <p className="text-sm text-paper/50 mt-3">Access granted</p>
              )}

              <p className="text-xs text-paper/30 mt-8">Scanning next ticket in a moment&hellip;</p>
            </div>
          </div>
        )}

        {state === 'idle' && !error && !cameraReady && (
          <div className="text-center text-paper/40">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-paper/20 border-t-paper/60 mx-auto mb-3" />
            <p className="text-sm">Starting camera&hellip;</p>
          </div>
        )}
      </div>

      <footer className="px-4 py-3 bg-ink border-t border-paper/10 flex items-center justify-between">
        <div className="text-xs text-paper/30">Point camera at QR code</div>
        {outcome && (
          <button type="button" onClick={restart} className="text-xs font-medium text-coral hover:text-coral/80 transition-colors">
            Scan next &rarr;
          </button>
        )}
      </footer>
    </div>
  );
}
