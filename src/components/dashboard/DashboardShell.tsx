'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import PushSetup from './PushSetup';
import { useTheme } from './ThemeProvider';

export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface DashboardShellProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    id?: string | null;
    role?: string | null;
  };
  initialUnreadCount: number;
  vapidPublicKey: string;
  navItems: NavItem[];
  bottomNavItems?: NavItem[];
  children: React.ReactNode;
}

function getPageTitle(pathname: string): string {
  const segment = pathname.split('/').filter(Boolean);
  if (segment.length === 0) return 'Home';
  if (segment.length === 1) {
    if (segment[0] === 'dashboard') return 'Dashboard';
    if (segment[0] === 'vendor') return 'Overview';
    if (segment[0] === 'admin') return 'Overview';
    return segment[0].charAt(0).toUpperCase() + segment[0].slice(1);
  }
  const page = segment[segment.length - 1];
  return page.charAt(0).toUpperCase() + page.slice(1);
}

function UserAvatar({ name, image }: { name?: string | null; image?: string | null }) {
  if (image) {
    return (
      <img src={image} alt="" className="h-8 w-8 rounded-full object-cover ring-2 ring-paper" />
    );
  }

  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-coral text-paper text-sm font-semibold ring-2 ring-paper">
      {initials}
    </div>
  );
}

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function DashboardShell({ user, initialUnreadCount, vapidPublicKey, navItems, bottomNavItems = [], children }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    }
    if (userDropdownOpen || notifOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userDropdownOpen, notifOpen]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    fetch('/api/user/unread-count')
      .then((r) => r.json())
      .then((d) => setUnreadCount(d.count))
      .catch(() => {});
  }, []);

  const [filteredNavItems, setFilteredNavItems] = useState(navItems);
  useEffect(() => {
    if (user.role === 'CUSTOMER') {
      fetch('/api/user/vendor-status')
        .then((r) => r.json())
        .then((d) => {
          if (d.hasVendorProfile) {
            setFilteredNavItems(navItems.filter((item) => item.href !== '/become-a-vendor'));
          }
        })
        .catch(() => {});
    }
  }, [user.role, navItems]);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications?limit=8');
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {
      // silently fail
    }
  }, []);

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
      setUnreadCount((c) => Math.max(0, c - 1));
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
      setUnreadCount(0);
    } catch {
      // silently fail
    }
  }, []);

  const toggleNotif = useCallback(() => {
    if (!notifOpen) {
      fetchNotifications();
    }
    setNotifOpen((o) => !o);
  }, [notifOpen, fetchNotifications]);

  const isActive = (href: string) => {
    if (href === '/' && pathname !== '/') return false;
    if (pathname === href) return true;
    return pathname.startsWith(href + '/');
  };

  return (
    <div className="min-h-screen bg-paper">
      <div
        className={`fixed inset-0 z-30 bg-ink/50 transition-opacity lg:hidden ${
          sidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-ink transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center gap-2 border-b border-ink/20 px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-coral text-paper font-body text-sm font-semibold">
            KF
          </div>
          <span className="font-display font-bold text-base text-paper">Fun Day Kenya</span>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {filteredNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? 'bg-coral/20 text-coral'
                  : 'text-paper/60 hover:bg-ink/20 hover:text-paper'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-ink/20 px-4 py-4 space-y-3">
          <div className="flex items-center gap-3">
            <UserAvatar name={user.name} image={user.image} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-paper truncate">{user.name || 'User'}</p>
              {user.email && (
                <p className="text-xs text-paper/50 truncate">{user.email}</p>
              )}
            </div>
          </div>

          {user.role && (
            <span className="inline-flex items-center rounded-full bg-coral/20 px-2.5 py-0.5 text-xs font-medium text-coral">
              {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
            </span>
          )}

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-paper/60 hover:bg-ink/20 hover:text-paper transition-colors flex-1"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              )}
              {theme === 'light' ? 'Dark mode' : 'Light mode'}
            </button>
          </div>

          {bottomNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? 'bg-coral/20 text-coral'
                  : 'text-paper/60 hover:bg-ink/20 hover:text-paper'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={async () => { await signOut({ redirect: false }); router.replace('/'); }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-paper/60 hover:bg-coral/20 hover:text-coral transition-colors"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-ink/10 bg-paper px-4 md:px-6">
          <button
            type="button"
            className="lg:hidden -ml-2 inline-flex h-10 w-10 items-center justify-center rounded-lg text-ink hover:bg-ink/5 transition-colors"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <div className="flex-1">
            <h1 className="font-display font-semibold text-xl text-ink">
              {getPageTitle(pathname)}
            </h1>
          </div>

          <div className="relative" ref={notifRef}>
            <button
              type="button"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg text-ink/60 hover:bg-ink/5 hover:text-ink transition-colors"
              onClick={toggleNotif}
              aria-expanded={notifOpen}
              aria-haspopup="true"
              aria-label="Notifications"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-coral px-1 text-[10px] font-bold text-paper leading-none">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 rounded-xl bg-paper border border-ink/10 shadow-soft-lg py-1 z-50 max-h-[480px] flex flex-col">
                <div className="flex items-center justify-between px-4 py-3 border-b border-ink/10 shrink-0">
                  <p className="text-sm font-semibold text-ink">Notifications</p>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllAsRead}
                      className="text-xs font-medium text-coral hover:text-coral/80 transition-colors"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="overflow-y-auto flex-1">
                  {notifications.length === 0 ? (
                    <p className="px-4 py-8 text-center text-sm text-ink/40">No notifications yet</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-ink/5 ${!n.isRead ? 'bg-coral/5' : ''}`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${n.isRead ? 'text-ink/70' : 'text-ink font-medium'}`}>
                            {n.title}
                          </p>
                          <p className="text-xs text-ink/50 mt-0.5 line-clamp-2">{n.message}</p>
                        </div>
                        {!n.isRead && (
                          <button
                            type="button"
                            onClick={() => markAsRead(n.id)}
                            className="shrink-0 mt-0.5 rounded-full p-1 text-ink/30 hover:text-coral hover:bg-coral/10 transition-colors"
                            aria-label="Mark as read"
                          >
                            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <Link
                  href="/dashboard/notifications"
                  onClick={() => setNotifOpen(false)}
                  className="block text-center text-sm font-medium text-coral border-t border-ink/10 py-3 hover:bg-ink/5 transition-colors shrink-0"
                >
                  View all notifications
                </Link>
              </div>
            )}
          </div>

          <div className="relative" ref={userDropdownRef}>
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-ink/5 transition-colors"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              aria-expanded={userDropdownOpen}
              aria-haspopup="true"
            >
              <UserAvatar name={user.name} image={user.image} />
              <span className="hidden md:block text-sm font-medium text-ink max-w-[120px] truncate">
                {user.name || 'User'}
              </span>
              <svg
                className={`hidden md:block h-4 w-4 text-ink/40 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-paper border border-ink/10 shadow-soft-lg py-1 z-50">
                <div className="px-4 py-3 border-b border-ink/10">
                  <p className="text-sm font-medium text-ink">{user.name || 'User'}</p>
                  {user.email && (
                    <p className="text-xs text-ink/50 mt-0.5 truncate">{user.email}</p>
                  )}
                </div>
                <Link
                  href={user.role === 'ADMIN' ? '/admin/profile' : user.role === 'VENDOR' ? '/vendor/profile' : '/dashboard/profile'}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink/70 hover:bg-ink/5 hover:text-ink transition-colors"
                  onClick={() => setUserDropdownOpen(false)
}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Profile
                </Link>
                <Link
                  href={user.role === 'ADMIN' ? '/admin/settings' : user.role === 'VENDOR' ? '/vendor/settings' : '/dashboard/settings'}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink/70 hover:bg-ink/5 hover:text-ink transition-colors"
                  onClick={() => setUserDropdownOpen(false)
}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                  </svg>
                  Settings
                </Link>
                <div className="border-t border-ink/10 my-1" />
                <button
                  type="button"
                  onClick={async () => {
                    setUserDropdownOpen(false);
                    await signOut({ redirect: false });
                    router.replace('/');
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-coral hover:bg-coral/5 transition-colors"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>

      <PushSetup vapidPublicKey={vapidPublicKey} />
    </div>
  );
}
