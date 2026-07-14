import Link from 'next/link';

export default function ServiceNotFound() {
  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-ink/10 bg-paper/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-coral text-paper text-sm font-bold">
              KF
            </span>
            <span className="font-display text-lg font-bold text-ink hidden sm:inline">
              Kids &amp; Family Fun Day
            </span>
          </Link>
        </div>
      </header>

      <main>
        <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8 py-24 text-center">
          <h1 className="font-display text-4xl font-bold text-ink mb-4">Service Not Found</h1>
          <p className="text-ink/60 mb-8 max-w-md mx-auto">
            The service you are looking for does not exist or is no longer available.
          </p>
          <Link href="/events" className="btn-primary">
            Browse Events
          </Link>
        </div>
      </main>

      <footer className="border-t border-ink/10 bg-paper py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 text-center text-sm text-ink/50">
          <p>&copy; 2026 Kids &amp; Family Fun Day Kenya. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
