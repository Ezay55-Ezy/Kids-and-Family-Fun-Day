'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatRelativeTime } from '@/lib/format';

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

function NotificationTypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    BOOKING_UPDATE: 'bg-coral/10 text-coral',
    PAYMENT_UPDATE: 'bg-grass/10 text-grass',
    VENDOR_STATUS: 'bg-sky/10 text-sky',
    SYSTEM: 'bg-ink/10 text-ink/70',
  };

  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium ${colors[type] || 'bg-ink/10 text-ink/70'}`}>
      {type.replace(/_/g, ' ')}
    </span>
  );
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications?limit=100');
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id }),
      });
      if (!res.ok) return;
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
    } catch {
      // silently fail
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      });
      if (!res.ok) return;
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // silently fail
    }
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-ink">Notifications</h2>
          {!loading && (
            <p className="text-sm text-ink/50 mt-1">
              {unreadCount === 0
                ? 'All caught up'
                : `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            className="rounded-lg px-3 py-2 text-sm font-medium text-coral hover:bg-coral/10 transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="space-y-2">
        {loading ? (
          <p className="text-sm text-ink/40 py-8 text-center">Loading...</p>
        ) : notifications.length === 0 ? (
          <div className="rounded-xl border border-ink/10 bg-paper py-12 text-center">
            <svg className="mx-auto h-10 w-10 text-ink/20 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <p className="text-sm text-ink/40">No notifications yet</p>
            <p className="text-xs text-ink/30 mt-1">
              Notifications will appear here when you make bookings or receive updates.
            </p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`rounded-xl border border-ink/10 p-4 transition-colors ${
                !n.isRead ? 'bg-coral/5 border-coral/20' : 'bg-paper'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <NotificationTypeBadge type={n.type} />
                    {!n.isRead && (
                      <span className="h-2 w-2 rounded-full bg-coral shrink-0" aria-label="Unread" />
                    )}
                    <span className="text-xs text-ink/40 ml-auto shrink-0">{formatRelativeTime(n.createdAt)}</span>
                  </div>
                  <p className={`text-sm ${n.isRead ? 'text-ink/70' : 'text-ink font-medium'}`}>
                    {n.title}
                  </p>
                  <p className="text-xs text-ink/50 mt-0.5">{n.message}</p>
                </div>
                {!n.isRead && (
                  <button
                    type="button"
                    onClick={() => markAsRead(n.id)}
                    className="shrink-0 mt-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-coral hover:bg-coral/10 transition-colors"
                  >
                    Mark read
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
