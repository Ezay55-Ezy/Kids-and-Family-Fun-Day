'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[AdminError]', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-coral/10">
          <span className="font-display text-4xl font-bold text-coral">!</span>
        </div>
        <h1 className="font-display text-2xl font-bold text-ink">Admin Error</h1>
        <p className="mt-3 text-ink/60 leading-relaxed">
          Something went wrong in the admin panel. Please try again.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button onClick={reset} className="btn-primary">
            Try Again
          </button>
          <Link href="/admin" className="btn-secondary">
            Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
