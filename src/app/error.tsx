'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[GlobalError]', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-coral/10">
          <span className="font-display text-4xl font-bold text-coral">!</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-ink">Something went wrong</h1>
        <p className="mt-3 text-ink/60 leading-relaxed">
          An unexpected error occurred. Please try again or return to the homepage.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button onClick={reset} className="btn-primary">
            Try Again
          </button>
          <Link href="/" className="btn-secondary">
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
