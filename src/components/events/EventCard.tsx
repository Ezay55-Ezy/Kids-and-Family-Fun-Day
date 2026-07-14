import Link from 'next/link';
import { formatDateWithWeekday, formatTime } from '@/lib/format';

export interface EventCardProps {
  id: string;
  slug: string;
  title: string;
  shortDescription: string | null;
  startDate: string;
  endDate: string;
  location: string;
  bannerImageUrl: string | null;
}

export default function EventCard({
  slug,
  title,
  shortDescription,
  startDate,
  endDate,
  location,
  bannerImageUrl,
}: EventCardProps) {
  const isPast = new Date(endDate) < new Date();

  return (
    <article className="group relative flex flex-col rounded-xl bg-paper border border-ink/10 shadow-soft overflow-hidden transition-all duration-300 hover:shadow-soft-lg hover:-translate-y-0.5">
      <div className="relative aspect-[16/9] overflow-hidden bg-ink/5">
        {bannerImageUrl ? (
          <img
            src={bannerImageUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-sky/20 via-sun/20 to-grass/20" />
        )}
        {isPast && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/40">
            <span className="rounded-full bg-paper/90 px-4 py-1.5 text-sm font-semibold text-ink">
              Past Event
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center gap-3 text-xs text-ink/50">
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            {formatDateWithWeekday(startDate)} at {formatTime(startDate)}
          </span>
        </div>

        <h3 className="font-display text-lg font-bold text-ink line-clamp-2">
          {title}
        </h3>

        <div className="flex items-center gap-1.5 text-xs text-ink/50">
          <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span>{location}</span>
        </div>

        {shortDescription && (
          <p className="text-sm text-ink/60 line-clamp-2 leading-relaxed">
            {shortDescription}
          </p>
        )}

        <div className="mt-auto pt-2">
          <Link
            href={`/events/${slug}`}
            className="btn-secondary w-full text-sm py-2.5"
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}
