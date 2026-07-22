import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import { getPublishedEventBySlug, listRelatedEvents } from '@/services/event-service';
import { canReviewEvent } from '@/services/review-service';
import EventCard from '@/components/events/EventCard';
import TicketSelection from '@/components/tickets/TicketSelection';
import ReviewSection from '@/components/reviews/ReviewSection';
import VendorMarketplaceSection from '@/components/vendor/VendorMarketplaceSection';
import { formatDate, formatDateWithWeekday, formatTime } from '@/lib/format';

type Params = Promise<{ slug: string }>;

function formatRange(start: Date, end: Date): string {
  const sameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();

  if (sameDay) {
    return `${formatDateWithWeekday(start)}, ${formatTime(start)} – ${formatTime(end)}`;
  }

  return `${formatDateWithWeekday(start)}, ${formatTime(start)} – ${formatDateWithWeekday(end)}, ${formatTime(end)}`;
}

function RegistrationStatusBadge({
  status,
  openDate,
  closeDate,
}: {
  status: string;
  openDate: Date | null;
  closeDate: Date | null;
}) {
  const now = new Date();

  if (status === 'SOLD_OUT') {
    return (
      <span className="inline-flex items-center rounded-full bg-coral/10 px-3.5 py-1 text-sm font-semibold text-coral ring-1 ring-coral/20">
        Sold Out
      </span>
    );
  }

  if (closeDate && now > closeDate) {
    return (
      <span className="inline-flex items-center rounded-full bg-ink/10 px-3.5 py-1 text-sm font-semibold text-ink/50 ring-1 ring-ink/10">
        Registration Closed
      </span>
    );
  }

  if (openDate && now < openDate) {
    return (
      <span className="inline-flex items-center rounded-full bg-sun/10 px-3.5 py-1 text-sm font-semibold text-sun ring-1 ring-sun/20">
        Opens {formatDateWithWeekday(openDate)}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-grass/10 px-3.5 py-1 text-sm font-semibold text-grass ring-1 ring-grass/20">
      Register Now
    </span>
  );
}

export async function generateMetadata(props: { params: Params }): Promise<Metadata> {
  const { slug } = await props.params;

  try {
    const event = await getPublishedEventBySlug(slug);

    return {
      title: event.title,
      description: event.shortDescription ?? event.description.slice(0, 160),
      openGraph: event.bannerImageUrl
        ? {
            images: [{ url: event.bannerImageUrl, width: 1200, height: 630, alt: event.title }],
          }
        : undefined,
    };
  } catch {
    return { title: 'Event Not Found' };
  }
}

export default async function EventDetailPage(props: { params: Params }) {
  const { slug } = await props.params;

  const event = await getPublishedEventBySlug(slug).catch(() => null);
  if (!event) notFound();

  const [session, relatedEvents] = await Promise.all([
    auth(),
    listRelatedEvents(event.id, 3),
  ]);
  const userId = session?.user?.id;

  const isPast = new Date(event.endDate) < new Date();
  const hasRegistrationDates = event.registrationOpenDate || event.registrationCloseDate;

  const reviews = event.reviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt.toISOString(),
    user: { name: r.user.name },
  }));
  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / totalReviews) * 10) / 10
      : 0;
  const userCanReview = userId ? await canReviewEvent(userId, event.id) : false;

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
        <article>
          {event.bannerImageUrl ? (
            <div className="relative h-[300px] md:h-[450px] overflow-hidden bg-ink/5">
              <img
                src={event.bannerImageUrl}
                alt={event.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
            </div>
          ) : (
            <div className="h-[200px] md:h-[300px] bg-gradient-to-br from-sky/20 via-sun/20 to-grass/20" />
          )}

          <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8 -mt-16 md:-mt-24 relative z-10">
            <div className="rounded-xl bg-paper border border-ink/10 shadow-soft-lg p-6 md:p-10">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {event.category && (
                  <span className="inline-flex items-center rounded-full bg-sky/10 px-3 py-1 text-xs font-medium text-sky ring-1 ring-sky/20">
                    {event.category.name}
                  </span>
                )}
                {hasRegistrationDates && (
                  <RegistrationStatusBadge
                    status={event.status}
                    openDate={event.registrationOpenDate}
                    closeDate={event.registrationCloseDate}
                  />
                )}
                {isPast && (
                  <span className="inline-flex items-center rounded-full bg-ink/10 px-3 py-1 text-xs font-medium text-ink/50 ring-1 ring-ink/10">
                    Past Event
                  </span>
                )}
              </div>

              <h1 className="font-display text-3xl md:text-4xl font-bold text-ink">
                {event.title}
              </h1>

              {event.shortDescription && (
                <p className="mt-3 text-lg text-ink/60 leading-relaxed">
                  {event.shortDescription}
                </p>
              )}

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3 rounded-lg bg-ink/5 p-4">
                  <svg className="mt-0.5 h-5 w-5 shrink-0 text-coral" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                  <div>
                    <p className="text-xs font-medium text-ink/50 uppercase tracking-wider">Date & Time</p>
                    <p className="mt-0.5 text-sm font-medium text-ink">
                      {formatRange(event.startDate, event.endDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg bg-ink/5 p-4">
                  <svg className="mt-0.5 h-5 w-5 shrink-0 text-coral" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <div>
                    <p className="text-xs font-medium text-ink/50 uppercase tracking-wider">Venue</p>
                    <p className="mt-0.5 text-sm font-medium text-ink">{event.location}</p>
                  </div>
                </div>
              </div>

              {hasRegistrationDates && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {event.registrationOpenDate && (
                    <div className="flex items-start gap-3 rounded-lg bg-ink/5 p-4">
                      <svg className="mt-0.5 h-5 w-5 shrink-0 text-grass" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                      </svg>
                      <div>
                        <p className="text-xs font-medium text-ink/50 uppercase tracking-wider">Registration Opens</p>
                        <p className="mt-0.5 text-sm font-medium text-ink">
                          {formatDate(event.registrationOpenDate)}
                        </p>
                      </div>
                    </div>
                  )}
                  {event.registrationCloseDate && (
                    <div className="flex items-start gap-3 rounded-lg bg-ink/5 p-4">
                      <svg className="mt-0.5 h-5 w-5 shrink-0 text-coral" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                      </svg>
                      <div>
                        <p className="text-xs font-medium text-ink/50 uppercase tracking-wider">Registration Closes</p>
                        <p className="mt-0.5 text-sm font-medium text-ink">
                          {formatDate(event.registrationCloseDate)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-8">
                <div className="prose prose-ink max-w-none">
                  {event.description.split('\n').map((paragraph, i) => (
                    <p key={i} className="text-base text-ink/70 leading-relaxed mb-4 last:mb-0">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              <TicketSelection
                eventId={event.id}
                eventSlug={slug}
                ticketTypes={event.ticketTypes.map((tt) => ({
                  id: tt.id,
                  name: tt.name,
                  description: tt.description,
                  price: Number(tt.price),
                  capacity: tt.capacity,
                  ticketsSold: tt.ticketsSold,
                }))}
              />
            </div>
          </div>

          {(totalReviews > 0 || userCanReview) && (
            <ReviewSection
              eventId={event.id}
              initialReviews={reviews}
              initialAverageRating={averageRating}
              initialTotalReviews={totalReviews}
              canReview={userCanReview}
            />
          )}

          {event.sponsors.length > 0 && (
            <section className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8 mt-12">
              <h2 className="font-display text-2xl font-bold text-ink mb-6">Sponsors</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {event.sponsors.map(({ sponsor }) => (
                  <div
                    key={sponsor.id}
                    className="flex items-center gap-4 rounded-xl border border-ink/10 bg-paper p-5 shadow-soft"
                  >
                    {sponsor.logoUrl ? (
                      <img
                        src={sponsor.logoUrl}
                        alt={sponsor.companyName}
                        className="h-14 w-14 rounded-lg object-cover bg-ink/5 mix-blend-multiply"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-sky/10 text-sky font-display font-bold text-lg">
                        {sponsor.companyName.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-display font-semibold text-ink truncate">
                        {sponsor.companyName}
                      </p>
                      <p className="text-xs text-ink/50 capitalize">{sponsor.tier.toLowerCase()} Sponsor</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <VendorMarketplaceSection />

          {event.gallery.length > 0 && (
            <section className="mx-auto max-w-5xl px-4 md:px-6 lg:px-8 mt-12">
              <h2 className="font-display text-2xl font-bold text-ink mb-6">Gallery</h2>
              <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
                {event.gallery.map((image) => (
                  <div key={image.id} className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-ink/5">
                    <img
                      src={image.imageUrl}
                      alt={image.title || image.caption || ''}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    {(image.title || image.caption) && (
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="text-xs text-paper font-medium">{image.title || image.caption}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </article>

        {relatedEvents.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 mt-16 mb-12">
            <h2 className="font-display text-2xl font-bold text-ink mb-8">
              Other Upcoming Events
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedEvents.map((ev) => (
                <EventCard
                  key={ev.id}
                  id={ev.id}
                  slug={ev.slug}
                  title={ev.title}
                  shortDescription={ev.shortDescription}
                  startDate={ev.startDate.toISOString()}
                  endDate={ev.endDate.toISOString()}
                  location={ev.location}
                  bannerImageUrl={ev.bannerImageUrl}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-ink/10 bg-paper py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 text-center text-sm text-ink/50">
          <p>© {new Date().getFullYear()} Kids & Family Fun Day Kenya. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
