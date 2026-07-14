'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/format';

interface ReviewUser {
  name: string | null;
}

interface ReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: ReviewUser;
}

interface ReviewSectionProps {
  eventId: string;
  initialReviews: ReviewItem[];
  initialAverageRating: number;
  initialTotalReviews: number;
  canReview: boolean;
}

function Star({ filled, onClick }: { filled: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-6 w-6 transition-colors ${
        onClick ? 'cursor-pointer hover:scale-110' : 'cursor-default'
      }`}
      aria-hidden={!onClick}
      tabIndex={onClick ? 0 : -1}
    >
      <svg viewBox="0 0 24 24" fill={filled ? '#FCA311' : 'none'} stroke="#FCA311" strokeWidth="2" aria-hidden="true">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    </button>
  );
}

export default function ReviewSection({
  eventId,
  initialReviews,
  initialAverageRating,
  initialTotalReviews,
  canReview,
}: ReviewSectionProps) {
  const router = useRouter();
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);
  const [avgRating, setAvgRating] = useState(initialAverageRating);
  const [totalReviews, setTotalReviews] = useState(initialTotalReviews);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) return;
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, rating, comment: comment.trim() || null }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (res.status === 401) {
          router.push('/auth/login');
          return;
        }
        setError(data.error || 'Failed to submit review.');
        return;
      }

      const data = await res.json();
      const newReview = data.review as ReviewItem;

      const updated = [newReview, ...reviews];
      const newAvg = updated.reduce((s, r) => s + r.rating, 0) / updated.length;
      setReviews(updated);
      setAvgRating(Math.round(newAvg * 10) / 10);
      setTotalReviews(updated.length);
      setRating(0);
      setComment('');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (totalReviews === 0 && !canReview) return null;

  return (
    <section className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8 mt-12">
      <h2 className="font-display text-2xl font-bold text-ink mb-6">Reviews</h2>

      {totalReviews > 0 && (
        <div className="flex items-center gap-3 mb-8 p-4 rounded-xl bg-ink/5">
          <span className="font-display text-4xl font-bold text-ink">{avgRating}</span>
          <div>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} filled={s <= Math.round(avgRating)} />
              ))}
            </div>
            <p className="text-xs text-ink/50 mt-0.5">
              {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
            </p>
          </div>
        </div>
      )}

      {canReview && (
        <form onSubmit={handleSubmit} className="mb-8 p-5 rounded-xl border border-ink/10 bg-paper">
          <p className="text-sm font-medium text-ink mb-3">Leave a review</p>

          <div className="flex gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setRating(s)}
                onMouseEnter={() => setHover(s)}
                onMouseLeave={() => setHover(0)}
                className="h-8 w-8 transition-transform hover:scale-110"
                aria-label={`${s} star${s > 1 ? 's' : ''}`}
              >
                <svg viewBox="0 0 24 24" fill={s <= (hover || rating) ? '#FCA311' : 'none'} stroke="#FCA311" strokeWidth="2" aria-hidden="true">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </button>
            ))}
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience (optional)"
            rows={3}
            maxLength={1000}
            className="w-full rounded-lg border border-ink/10 bg-paper px-3 py-2.5 text-sm text-ink placeholder:text-ink/30 resize-none focus:outline-none focus:ring-2 focus:ring-coral/50"
          />

          {error && (
            <p className="mt-2 text-xs text-coral">{error}</p>
          )}

          <button
            type="submit"
            disabled={rating === 0 || submitting}
            className="mt-3 rounded-lg bg-coral px-4 py-2 text-sm font-semibold text-paper hover:bg-coral/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      )}

      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="rounded-xl border border-ink/10 bg-paper p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-coral/10 text-coral text-xs font-bold">
                  {(review.user.name?.[0] || 'A').toUpperCase()}
                </div>
                <span className="text-sm font-medium text-ink">
                  {review.user.name || 'Anonymous'}
                </span>
              </div>
              <span className="text-xs text-ink/40">{formatDate(review.createdAt)}</span>
            </div>

            <div className="flex gap-0.5 mb-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} filled={s <= review.rating} />
              ))}
            </div>

            {review.comment && (
              <p className="text-sm text-ink/70 leading-relaxed">{review.comment}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
