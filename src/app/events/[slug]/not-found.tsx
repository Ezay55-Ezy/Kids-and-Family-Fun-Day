import Link from 'next/link';

export default function EventNotFound() {
  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <header className="border-b border-ink/10 bg-paper/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4 md:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 font-display font-bold text-xl text-ink"
            aria-label="Kids & Family Fun Day Kenya - Home"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-coral text-paper font-body text-sm font-semibold">
              KF
            </span>
            <span className="hidden sm:block">Kids & Family Fun Day Kenya</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-coral/10">
            <span className="font-display text-4xl font-bold text-coral">404</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-ink">Event not found</h1>
          <p className="mt-3 text-ink/60 leading-relaxed">
            The event you are looking for does not exist or has been removed. It may have ended or the link may be incorrect.
          </p>
          <Link href="/events" className="btn-primary mt-8 inline-flex">
            Browse Events
          </Link>
        </div>
      </main>

      <footer className="border-t border-ink/10 bg-paper py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 text-center text-sm text-ink/50">
          <p>© {new Date().getFullYear()} Kids & Family Fun Day Kenya. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
