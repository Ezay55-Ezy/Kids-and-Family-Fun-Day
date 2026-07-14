'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatDate } from '@/lib/format';

interface UserDetail {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  isActive: boolean;
  suspendedAt: string | null;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  _count: { bookings: number; reviews: number; tickets: number; notifications: number };
  bookings: Array<{
    id: string;
    ticketCode: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    event: { title: string };
  }>;
  reviews: Array<{
    id: string;
    rating: number;
    comment: string | null;
    status: string;
    createdAt: string;
  }>;
}

const roleStyles: Record<string, string> = {
  ADMIN: 'bg-coral/10 text-coral ring-coral/20',
  VENDOR: 'bg-sky/10 text-sky ring-sky/20',
  CUSTOMER: 'bg-grass/10 text-grass ring-grass/20',
  SPONSOR: 'bg-sun/10 text-sun ring-sun/20',
};

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(`/api/admin/users/${params.userId}`);
        if (!res.ok) throw new Error('Failed to fetch');
        setUser(await res.json());
      } catch {
        setError('Failed to load user');
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [params.userId]);

  async function handleSuspend() {
    if (!confirm('Are you sure you want to suspend this user?')) return;
    setActionLoading(true);
    setActionMessage('');
    try {
      const res = await fetch(`/api/admin/users/${params.userId}/suspend`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUser((prev) => prev ? { ...prev, isActive: false, suspendedAt: data.suspendedAt } : null);
      setActionMessage('User suspended successfully');
    } catch (err) {
      setActionMessage((err as Error).message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReactivate() {
    setActionLoading(true);
    setActionMessage('');
    try {
      const res = await fetch(`/api/admin/users/${params.userId}/reactivate`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUser((prev) => prev ? { ...prev, isActive: true, suspendedAt: null } : null);
      setActionMessage('User reactivated successfully');
    } catch (err) {
      setActionMessage((err as Error).message);
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-ink/10" />
        <div className="h-64 animate-pulse rounded-xl bg-ink/5" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="rounded-xl border border-coral/20 bg-coral/5 p-6 text-center">
        <p className="text-coral">{error || 'User not found'}</p>
        <Link href="/admin/users" className="mt-3 inline-block text-sm text-sky hover:underline">Back to users</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {user.image ? (
            <img src={user.image} alt="" className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ink/10 text-2xl font-bold text-ink/60">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold text-ink">{user.name}</h1>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${roleStyles[user.role] || ''}`}>
                {user.role}
              </span>
              {!user.isActive && (
                <span className="inline-flex items-center rounded-full bg-coral/10 px-2.5 py-0.5 text-xs font-medium text-coral ring-1 ring-inset ring-coral/20">
                  Suspended
                </span>
              )}
            </div>
            <p className="text-ink/50">{user.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {user.isActive ? (
            <button
              onClick={handleSuspend}
              disabled={actionLoading}
              className="rounded-lg border border-coral/20 bg-coral/10 px-4 py-2 text-sm font-medium text-coral hover:bg-coral/20 disabled:opacity-50"
            >
              {actionLoading ? 'Processing...' : 'Suspend User'}
            </button>
          ) : (
            <button
              onClick={handleReactivate}
              disabled={actionLoading}
              className="rounded-lg border border-grass/20 bg-grass/10 px-4 py-2 text-sm font-medium text-grass hover:bg-grass/20 disabled:opacity-50"
            >
              {actionLoading ? 'Processing...' : 'Reactivate User'}
            </button>
          )}
        </div>
      </div>

      {actionMessage && (
        <div className={`rounded-lg p-3 text-sm ${actionMessage.includes('success') ? 'bg-grass/10 text-grass' : 'bg-coral/10 text-coral'}`}>
          {actionMessage}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-ink/5 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-ink/50">Bookings</p>
          <p className="mt-1 text-2xl font-bold text-ink">{user._count.bookings}</p>
        </div>
        <div className="rounded-xl border border-ink/5 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-ink/50">Reviews</p>
          <p className="mt-1 text-2xl font-bold text-ink">{user._count.reviews}</p>
        </div>
        <div className="rounded-xl border border-ink/5 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-ink/50">Tickets</p>
          <p className="mt-1 text-2xl font-bold text-ink">{user._count.tickets}</p>
        </div>
        <div className="rounded-xl border border-ink/5 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-ink/50">Joined</p>
          <p className="mt-1 text-sm font-bold text-ink">{formatDate(user.createdAt)}</p>
        </div>
      </div>

      {user.phone && (
        <div className="rounded-xl border border-ink/5 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-ink/50">Phone</p>
          <p className="mt-1 text-ink">{user.phone}</p>
        </div>
      )}

      {user.suspendedAt && (
        <div className="rounded-xl border border-coral/10 bg-coral/5 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-coral/70">Suspended At</p>
          <p className="mt-1 text-coral">{formatDate(user.suspendedAt)}</p>
        </div>
      )}

      {user.bookings.length > 0 && (
        <div className="rounded-xl border border-ink/5 bg-white p-4">
          <h2 className="mb-3 font-display text-lg font-semibold text-ink">Recent Bookings</h2>
          <div className="space-y-2">
            {user.bookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between rounded-lg bg-ink/5 p-3">
                <div>
                  <p className="text-sm font-medium text-ink">{booking.event.title}</p>
                  <p className="text-xs text-ink/50">{booking.ticketCode} · {formatDate(booking.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-ink">KES {booking.totalAmount.toLocaleString()}</p>
                  <p className="text-xs text-ink/50">{booking.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {user.reviews.length > 0 && (
        <div className="rounded-xl border border-ink/5 bg-white p-4">
          <h2 className="mb-3 font-display text-lg font-semibold text-ink">Recent Reviews</h2>
          <div className="space-y-2">
            {user.reviews.map((review) => (
              <div key={review.id} className="rounded-lg bg-ink/5 p-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-sun">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                  <span className="text-xs text-ink/40">{formatDate(review.createdAt)}</span>
                </div>
                {review.comment && <p className="mt-1 text-sm text-ink/70">{review.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      <Link href="/admin/users" className="inline-block text-sm text-sky hover:underline">← Back to users</Link>
    </div>
  );
}
