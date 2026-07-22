import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatDate, formatTime } from '@/lib/format';
import MobileMenu from '@/components/home/MobileMenu';
import HomeNewsletter from '@/components/home/HomeNewsletter';

export const revalidate = 60;

export default async function HomePage() {
  const now = new Date();

  let eventCount = 0;
  let vendorCount = 0;
  let upcomingEvents: Array<{
    id: string;
    slug: string;
    title: string;
    location: string;
    startDate: Date;
    endDate: Date;
    shortDescription: string | null;
    bannerImageUrl: string | null;
    category: { name: string } | null;
  }> = [];
  let vendors: Array<{
    id: string;
    businessName: string;
    services: Array<{ name: string; shortDescription: string | null }>;
  }> = [];
  let sponsors: Array<{
    id: string;
    companyName: string;
    logoUrl: string | null;
    tier: string;
    websiteUrl: string | null;
  }> = [];
  let reviews: Array<{
    id: string;
    rating: number;
    comment: string | null;
    createdAt: Date;
    user: { name: string | null };
    event: { title: string };
  }> = [];
  let avgRating = 0;
  let reviewCount = 0;

  try {
    const results = await Promise.all([
      prisma.event.count({ where: { status: 'PUBLISHED' } }),
      prisma.vendor.count({ where: { status: 'ACTIVE' } }),
      prisma.event.findMany({
        where: { status: 'PUBLISHED', startDate: { gte: now } },
        include: {
          category: { select: { name: true } },
        },
        orderBy: { startDate: 'asc' },
        take: 3,
      }),
      prisma.vendor.findMany({
        where: {
          status: 'ACTIVE',
          services: { some: { isActive: true, isArchived: false } },
        },
        include: {
          services: {
            where: { isActive: true, isArchived: false },
            take: 1,
          },
        },
        orderBy: { businessName: 'asc' },
        take: 4,
      }),
      prisma.sponsor.findMany({
        where: { isPublished: true },
        select: {
          id: true,
          companyName: true,
          logoUrl: true,
          tier: true,
          websiteUrl: true,
        },
        orderBy: [{ displayOrder: 'asc' }, { companyName: 'asc' }],
        take: 8,
      }),
      prisma.review.findMany({
        where: { status: 'PUBLISHED', comment: { not: null } },
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          user: { select: { name: true } },
          event: { select: { title: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 6,
      }),
      prisma.review.aggregate({
        where: { status: 'PUBLISHED' },
        _avg: { rating: true },
        _count: { rating: true },
      }),
    ]);

    eventCount = results[0];
    vendorCount = results[1];
    upcomingEvents = results[2];
    vendors = results[3];
    sponsors = results[4];
    reviews = results[5];
    avgRating = results[6]._avg.rating ?? 0;
    reviewCount = results[6]._count.rating;
  } catch (e) {
    console.error('[HomePage] Failed to load data:', e);
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-20 lg:pb-0">
      {/* ─── Navigation ─── */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-slate-50/80 border-b border-slate-200/60">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2.5"
            aria-label="Kids & Family Fun Day Kenya - Home"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-700 text-white text-xs font-bold">
              KF
            </span>
            <span className="hidden sm:block font-display font-bold text-lg text-slate-900 tracking-tight">
              Kids &amp; Family Fun Day
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-0.5" aria-label="Main navigation">
            {[
              { label: 'Home', href: '/' },
              { label: 'Events', href: '/events' },
              { label: 'Vendors', href: '/vendors' },
              { label: 'Sponsors', href: '/sponsors' },
              { label: 'Gallery', href: '/gallery' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-1">
            <Link
              href="/auth/login"
              className="rounded-md px-3.5 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 shadow-sm transition-all duration-200"
            >
              Register
            </Link>
          </div>

          <MobileMenu />
        </div>
      </header>

      <main>
        {/* ─── Hero ─── */}
        <section className="bg-[#FAF9F6]">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-12 sm:pt-16 pb-12 text-center">
            {upcomingEvents.length > 0 && (
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3.5 py-1 text-sm font-medium text-teal-800 mb-6">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-600 animate-pulse" />
                {upcomingEvents.length} upcoming event{upcomingEvents.length > 1 ? 's' : ''} — book now
              </div>
            )}

            <h1 className="font-display text-4xl sm:text-5xl md:text-[3.5rem] font-extrabold leading-[1.08] tracking-tight text-slate-900">
              Creating Smiles,
              <br />
              Building Families,
              <br />
              <span className="text-teal-800">Growing Businesses</span>
            </h1>

            <p className="mt-5 text-lg md:text-xl text-slate-600 leading-relaxed max-w-xl mx-auto">
              Discover curated outdoor events, book tickets with M-Pesa, and
              create unforgettable memories with your loved ones.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/events"
                className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-7 py-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 active:scale-[0.98] transition-all duration-200"
              >
                Browse Events
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm text-slate-500">
              {reviewCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.round(avgRating) ? 'text-amber-400' : 'text-slate-200'
                        }`}
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  <span>
                    <span className="font-semibold text-slate-700">{avgRating.toFixed(1)}</span>{' '}
                    from {reviewCount} famil{reviewCount === 1 ? 'y' : 'ies'}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <svg className="h-4 w-4 text-teal-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Secure M-Pesa checkout
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="h-4 w-4 text-teal-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Instant QR tickets, no queues
              </div>
            </div>

            <div className="mt-8 flex justify-center gap-8 border-t border-slate-200 pt-6">
              <div>
                <span className="font-display text-2xl font-extrabold tracking-tight text-slate-900">
                  {eventCount}
                </span>
                <span className="ml-1.5 text-sm text-slate-500">
                  Active Event{eventCount !== 1 ? 's' : ''}
                </span>
              </div>
              <div>
                <span className="font-display text-2xl font-extrabold tracking-tight text-slate-900">
                  {vendorCount}
                </span>
                <span className="ml-1.5 text-sm text-slate-500">
                  Trusted Vendor{vendorCount !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Featured Events ─── */}
        {upcomingEvents.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-16 md:py-20">
            <div className="flex items-end justify-between gap-4 mb-8">
              <div>
                <p className="text-sm font-semibold text-teal-700 uppercase tracking-wider">
                  Coming Up
                </p>
                <h2 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 mt-1.5">
                  Featured Events
                </h2>
              </div>
              <Link
                href="/events"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
              >
                View All
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map((event) => {
                const isPast = new Date(event.endDate) < now;
                const daysUntil = Math.ceil(
                  (new Date(event.startDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                );
                const urgencyLabel =
                  !isPast && daysUntil <= 0
                    ? 'Happening now'
                    : !isPast && daysUntil === 1
                      ? 'Tomorrow'
                      : !isPast && daysUntil <= 7
                        ? `In ${daysUntil} days`
                        : null;
                return (
                  <Link
                    key={event.id}
                    href={`/events/${event.slug}`}
                    className="group rounded-xl border border-slate-200 bg-white overflow-hidden hover:border-slate-300 transition-all duration-200"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                      {event.bannerImageUrl ? (
                        <img
                          src={event.bannerImageUrl}
                          alt={event.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-teal-50 via-slate-50 to-amber-50" />
                      )}
                      {isPast && (
                        <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                          <span className="rounded-full bg-slate-900/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                            Past Event
                          </span>
                        </div>
                      )}
                      {event.category && (
                        <span className="absolute top-3 left-3 rounded-md bg-white/90 backdrop-blur-sm px-2.5 py-1 text-xs font-medium text-slate-700 border border-slate-200/50">
                          {event.category.name}
                        </span>
                      )}
                      {urgencyLabel && (
                        <span className="absolute top-3 right-3 rounded-md bg-teal-700 px-2.5 py-1 text-xs font-semibold text-white">
                          {urgencyLabel}
                        </span>
                      )}
                    </div>

                    <div className="p-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1.5">
                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" />
                          <path d="M16 2v4M8 2v4M3 10h18" />
                        </svg>
                        <span>
                          {formatDate(event.startDate)} &middot;{' '}
                          {formatTime(event.startDate)}
                        </span>
                      </div>
                      <h3 className="font-display font-semibold text-base text-slate-900 group-hover:text-teal-700 transition-colors line-clamp-1">
                        {event.title}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-400">
                        <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span className="truncate">{event.location}</span>
                      </div>
                      {event.shortDescription && (
                        <p className="mt-2.5 text-sm text-slate-500 line-clamp-2 leading-relaxed">
                          {event.shortDescription}
                        </p>
                      )}
                      <div className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-teal-700 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        View Details
                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="mt-6 text-center sm:hidden">
              <Link
                href="/events"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
              >
                View All Events
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </section>
        )}

        {/* ─── Why Choose Us ─── */}
        <section className="bg-slate-50/60">
          <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-16 md:py-20">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <p className="text-sm font-semibold text-teal-700 uppercase tracking-wider">
                Why Us
              </p>
              <h2 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 mt-1.5">
                Everything Families Need
              </h2>
              <p className="mt-3 text-slate-500 text-lg leading-relaxed">
                A complete platform designed to make family events seamless,
                from discovery to entry.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: (
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  ),
                  title: 'Secure Booking',
                  desc: 'Pay with M-Pesa and receive instant confirmation. Your payment is always protected.',
                },
                {
                  icon: (
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                  title: 'Family Friendly',
                  desc: 'Every event is curated with kids and families in mind. Safe, fun, and memorable.',
                },
                {
                  icon: (
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  ),
                  title: 'Trusted Vendors',
                  desc: 'Browse a marketplace of vetted vendors offering quality services for your events.',
                },
                {
                  icon: (
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                    </svg>
                  ),
                  title: 'QR Tickets',
                  desc: 'Get digital tickets with QR codes. Scan and enter — no paper, no queues.',
                },
                {
                  icon: (
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                    </svg>
                  ),
                  title: 'Notifications',
                  desc: 'Never miss an event. Get reminded about upcoming events and booking updates.',
                },
                {
                  icon: (
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  ),
                  title: 'Easy Registration',
                  desc: 'Create an account in seconds. Start booking events and managing your family calendar.',
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-xl border border-slate-200 bg-white p-5 hover:border-slate-300 transition-all duration-200"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                    {feature.icon}
                  </div>
                  <h3 className="font-display font-semibold text-base text-slate-900 mt-4">
                    {feature.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── How It Works ─── */}
        <section className="bg-white border-y border-slate-200/60">
          <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-16 md:py-20">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <p className="text-sm font-semibold text-teal-700 uppercase tracking-wider">
                Simple Process
              </p>
              <h2 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 mt-1.5">
                How It Works
              </h2>
              <p className="mt-3 text-slate-500 text-lg leading-relaxed">
                From discovery to entry, four simple steps to your next family adventure.
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 relative">
              <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-slate-200" />

              {[
                {
                  step: '01',
                  title: 'Discover Events',
                  desc: 'Browse upcoming family events near you. Filter by date, category, and location.',
                },
                {
                  step: '02',
                  title: 'Book Tickets',
                  desc: 'Select your tickets and pay securely with M-Pesa. Instant confirmation guaranteed.',
                },
                {
                  step: '03',
                  title: 'Get Digital Tickets',
                  desc: 'Receive QR-coded tickets instantly. Access them anytime from your dashboard.',
                },
                {
                  step: '04',
                  title: 'Enjoy the Event',
                  desc: 'Scan your QR code at the entrance. Focus on making memories with your family.',
                },
              ].map((item) => (
                <div key={item.step} className="relative text-center">
                  <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-xl border border-slate-200 bg-[#FAF9F6]">
                    <span className="font-display text-3xl font-extrabold tracking-tight text-teal-700">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="font-display font-semibold text-base text-slate-900 mt-4">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-slate-500 leading-relaxed max-w-[14rem] mx-auto">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Featured Vendors ─── */}
        {vendors.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-16 md:py-20">
            <div className="flex items-end justify-between gap-4 mb-8">
              <div>
                <p className="text-sm font-semibold text-teal-700 uppercase tracking-wider">
                  Marketplace
                </p>
                <h2 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 mt-1.5">
                  Featured Vendors
                </h2>
              </div>
              <Link
                href="/vendors"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
              >
                View Marketplace
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {vendors.map((vendor) => (
                <Link
                  key={vendor.id}
                  href={`/vendors/${vendor.id}`}
                  className="group rounded-xl border border-slate-200 bg-white p-5 hover:border-slate-300 transition-all duration-200"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-700 font-display font-bold text-sm shrink-0">
                      {vendor.businessName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display font-semibold text-sm text-slate-900 truncate group-hover:text-teal-700 transition-colors">
                        {vendor.businessName}
                      </h3>
                      <p className="text-xs text-slate-400 truncate">
                        {vendor.services.length} service{vendor.services.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  {vendor.services[0] && (
                    <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                      {vendor.services[0].shortDescription || vendor.services[0].name}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ─── Testimonials ─── */}
        {reviews.length > 0 && (
          <section className="bg-slate-50/60">
            <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-16 md:py-20">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <p className="text-sm font-semibold text-teal-700 uppercase tracking-wider">
                  Testimonials
                </p>
                <h2 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 mt-1.5">
                  What Families Say
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-xl border border-slate-200 bg-white p-5"
                  >
                    <div className="flex gap-0.5 mb-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating ? 'text-amber-400' : 'text-slate-200'
                          }`}
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed line-clamp-4">
                      &ldquo;{review.comment}&rdquo;
                    </p>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-50 text-teal-700 text-xs font-bold">
                        {(review.user.name || 'A')
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {review.user.name || 'Anonymous'}
                        </p>
                        <p className="text-xs text-slate-400">
                          {review.event.title}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ─── Sponsors ─── */}
        {sponsors.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-16 md:py-20">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <p className="text-sm font-semibold text-teal-700 uppercase tracking-wider">
                Our Partners
              </p>
              <h2 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 mt-1.5">
                Proud Sponsors
              </h2>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-5">
              {sponsors.map((sponsor) => {
                const tierStyle =
                  sponsor.tier === 'PLATINUM'
                    ? 'border-purple-200 bg-purple-50/40 hover:border-purple-300'
                    : sponsor.tier === 'GOLD'
                      ? 'border-amber-200 bg-amber-50/40 hover:border-amber-300'
                      : sponsor.tier === 'SILVER'
                        ? 'border-slate-200 bg-slate-50/40 hover:border-slate-300'
                        : 'border-slate-200 bg-white hover:border-slate-300';

                const sponsorLogo = (
                  <div className={`flex items-center gap-3 rounded-lg border px-5 py-3 transition-colors ${tierStyle}`}>
                    {sponsor.logoUrl ? (
                      <img
                        src={sponsor.logoUrl}
                        alt={sponsor.companyName}
                        className="h-7 md:h-8 w-auto object-contain mix-blend-multiply"
                      />
                    ) : (
                      <span className="font-display font-bold text-base text-slate-500">
                        {sponsor.companyName}
                      </span>
                    )}
                  </div>
                );

                return sponsor.websiteUrl ? (
                  <a
                    key={sponsor.id}
                    href={sponsor.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {sponsorLogo}
                  </a>
                ) : (
                  <div key={sponsor.id}>{sponsorLogo}</div>
                );
              })}
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/sponsors"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
              >
                View All Sponsors
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </section>
        )}

        {/* ─── Vendor Outreach ─── */}
        <section className="bg-slate-50/60 border-y border-slate-200/60">
          <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-16 md:py-20">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold text-teal-700 uppercase tracking-wider">
                Partner With Us
              </p>
              <h2 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 mt-1.5">
                Hosting a Family Event or Stall?
              </h2>
              <p className="mt-3 text-slate-500 text-lg leading-relaxed">
                Join Kenya&apos;s growing family events marketplace. Reach
                thousands of families, manage bookings, and grow your business
                with our platform.
              </p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/become-a-vendor"
                  className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 active:scale-[0.98] transition-all duration-200"
                >
                  Become a Vendor
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  href="/vendors"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-6 py-3 text-sm font-medium text-slate-700 hover:bg-white hover:border-slate-300 transition-all duration-200"
                >
                  View Marketplace
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Newsletter ─── */}
        <section className="bg-white border-b border-slate-200/60">
          <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-16 md:py-20">
            <div className="mx-auto max-w-xl text-center">
              <p className="text-sm font-semibold text-teal-700 uppercase tracking-wider">
                Stay in the Loop
              </p>
              <h2 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 mt-1.5">
                Never Miss an Event
              </h2>
              <p className="mt-3 text-slate-500 text-lg leading-relaxed">
                Get notified about upcoming events, early-bird offers, and
                family activities in your area.
              </p>
              <div className="mt-7 relative">
                <HomeNewsletter />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ─── Footer ─── */}
      <footer className="bg-[#FAF9F6]">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="lg:col-span-1">
              <Link href="/" className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-700 text-white text-xs font-bold">
                  KF
                </span>
                <span className="font-display font-bold text-base text-slate-900 tracking-tight">
                  Kids &amp; Family Fun Day
                </span>
              </Link>
              <p className="mt-3 text-sm text-slate-500 leading-relaxed max-w-xs">
                Kenya&apos;s premier outdoor family festival platform. Discover
                events, book tickets, and create lasting memories.
              </p>
              <div className="mt-4 flex gap-2">
                {[
                  { label: 'Facebook', path: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z' },
                  { label: 'Twitter', path: 'M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z' },
                  { label: 'Instagram', path: 'M16 4H8a4 4 0 00-4 4v8a4 4 0 004 4h8a4 4 0 004-4V8a4 4 0 00-4-4zm-4 11a3 3 0 110-6 3 3 0 010 6zm3.5-6.5a.75.75 0 110-1.5.75.75 0 010 1.5z' },
                ].map((social) => (
                  <a
                    key={social.label}
                    href="#"
                    aria-label={social.label}
                    className="flex h-11 w-11 items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300 transition-colors"
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={social.path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-display font-semibold text-xs text-slate-900 uppercase tracking-wider mb-3">
                Quick Links
              </h3>
              <ul className="space-y-2">
                {[
                  { label: 'Browse Events', href: '/events' },
                  { label: 'Vendor Marketplace', href: '/vendors' },
                  { label: 'Gallery', href: '/gallery' },
                  { label: 'Become a Vendor', href: '/become-a-vendor' },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Account */}
            <div>
              <h3 className="font-display font-semibold text-xs text-slate-900 uppercase tracking-wider mb-3">
                Account
              </h3>
              <ul className="space-y-2">
                {[
                  { label: 'Sign In', href: '/auth/login' },
                  { label: 'Register', href: '/auth/register' },
                  { label: 'Dashboard', href: '/dashboard' },
                  { label: 'My Bookings', href: '/dashboard/bookings' },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-display font-semibold text-xs text-slate-900 uppercase tracking-wider mb-3">
                Contact
              </h3>
              <ul className="space-y-2.5">
                <li className="flex items-start gap-2 text-sm text-slate-500">
                  <svg className="h-4 w-4 mt-0.5 shrink-0 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  Nairobi, Kenya
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-500">
                  <svg className="h-4 w-4 mt-0.5 shrink-0 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  info@kidsfamilyfunday.co.ke
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-500">
                  <svg className="h-4 w-4 mt-0.5 shrink-0 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  +254 700 000 000
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-400">
              &copy; {new Date().getFullYear()} Kids &amp; Family Fun Day Kenya. All rights reserved.
            </p>
            <div className="flex gap-5">
              <Link href="/privacy" className="text-xs text-slate-400 hover:text-slate-700 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-xs text-slate-400 hover:text-slate-700 transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* ─── Sticky Mobile CTA ─── */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-md px-4 py-3 lg:hidden">
        <Link
          href="/events"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal-700 py-2.5 text-sm font-semibold text-white active:scale-[0.98] transition-all duration-200"
        >
          Browse Events
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
