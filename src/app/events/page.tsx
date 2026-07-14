import type { Metadata } from 'next';
import Link from 'next/link';
import PublicEventsList from '@/components/events/PublicEventsList';

export const metadata: Metadata = {
  title: 'Events',
  description: 'Browse upcoming and past family-friendly events in Kenya',
};

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-ink/10 bg-paper/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6 lg:px-8">
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

      <main>
        <section className="border-b border-ink/10 bg-gradient-to-b from-ink/5 to-transparent">
          <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-16 md:py-24 text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-ink">
              Events
            </h1>
            <p className="mt-4 text-lg text-ink/60 max-w-2xl mx-auto">
              Discover family-friendly events across Kenya. From outdoor adventures to creative workshops, there is something for everyone.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-12">
          <PublicEventsList />
        </section>
      </main>

      <footer className="border-t border-ink/10 bg-paper py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 text-center text-sm text-ink/50">
          <p>© {new Date().getFullYear()} Kids & Family Fun Day Kenya. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
