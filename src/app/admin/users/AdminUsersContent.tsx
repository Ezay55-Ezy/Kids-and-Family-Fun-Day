'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatDate } from '@/lib/format';

interface UserItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  isActive: boolean;
  suspendedAt: string | null;
  image: string | null;
  createdAt: string;
  _count: { bookings: number; reviews: number };
}

interface UserStats {
  total: number;
  active: number;
  inactive: number;
  byRole: Array<{ role: string; count: number }>;
}

const roleStyles: Record<string, string> = {
  ADMIN: 'bg-coral/10 text-coral ring-coral/20',
  VENDOR: 'bg-sky/10 text-sky ring-sky/20',
  CUSTOMER: 'bg-grass/10 text-grass ring-grass/20',
  SPONSOR: 'bg-sun/10 text-sun ring-sun/20',
};

const filterTabs = [
  { label: 'All', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Suspended', value: 'inactive' },
];

export default function AdminUsersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const currentStatus = searchParams.get('status') || '';
  const currentRole = searchParams.get('role') || '';
  const currentSearch = searchParams.get('query') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (currentStatus) params.set('status', currentStatus);
      if (currentRole) params.set('role', currentRole);
      if (currentSearch) params.set('query', currentSearch);
      params.set('page', String(currentPage));
      params.set('limit', '10');

      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setUsers(data.users);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setStats(data.stats);
    } catch {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [currentStatus, currentRole, currentSearch, currentPage]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page');
    router.push(`?${params.toString()}`);
  }

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = (formData.get('query') as string) || '';
    updateParam('query', query);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-ink">User Management</h1>
        <p className="mt-1 font-body text-ink/60">Manage platform users, roles, and access</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-ink/5 bg-paper p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-ink/50">Total Users</p>
            <p className="mt-1 text-2xl font-bold text-ink">{stats.total}</p>
          </div>
          <div className="rounded-xl border border-ink/5 bg-paper p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-ink/50">Active</p>
            <p className="mt-1 text-2xl font-bold text-grass">{stats.active}</p>
          </div>
          <div className="rounded-xl border border-ink/5 bg-paper p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-ink/50">Suspended</p>
            <p className="mt-1 text-2xl font-bold text-coral">{stats.inactive}</p>
          </div>
          <div className="rounded-xl border border-ink/5 bg-paper p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-ink/50">Admins</p>
            <p className="mt-1 text-2xl font-bold text-sun">{stats.byRole.find((r) => r.role === 'ADMIN')?.count || 0}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 rounded-lg bg-ink/5 p-1">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => updateParam('status', tab.value)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                currentStatus === tab.value
                  ? 'bg-paper text-ink shadow-sm'
                  : 'text-ink/60 hover:text-ink'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            name="query"
            defaultValue={currentSearch}
            placeholder="Search by name or email..."
            className="rounded-lg border border-ink/10 bg-paper px-3 py-1.5 text-sm text-ink placeholder:text-ink/40 focus:border-sky focus:outline-none focus:ring-1 focus:ring-sky"
          />
          <button type="submit" className="rounded-lg bg-ink px-3 py-1.5 text-sm font-medium text-white hover:bg-ink/90">
            Search
          </button>
        </form>
      </div>

      {currentRole && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-ink/50">Role filter:</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-sky/10 px-2.5 py-0.5 text-xs font-medium text-sky">
            {currentRole}
            <button onClick={() => updateParam('role', '')} className="ml-0.5 hover:text-ink">×</button>
          </span>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-coral/10 p-3 text-sm text-coral">{error}</div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-ink/5" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-xl border border-ink/5 bg-paper p-12 text-center">
          <p className="text-ink/40">No users found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {users.map((user) => (
            <Link
              key={user.id}
              href={`/admin/users/${user.id}`}
              className="flex items-center justify-between rounded-xl border border-ink/5 bg-paper p-4 transition-colors hover:border-sky/20 hover:bg-sky/5"
            >
              <div className="flex items-center gap-4">
                {user.image ? (
                  <img src={user.image} alt="" className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink/10 text-sm font-bold text-ink/60">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-ink">{user.name}</p>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${roleStyles[user.role] || 'bg-ink/5 text-ink/60 ring-ink/10'}`}>
                      {user.role}
                    </span>
                    {!user.isActive && (
                      <span className="inline-flex items-center rounded-full bg-coral/10 px-2 py-0.5 text-xs font-medium text-coral ring-1 ring-inset ring-coral/20">
                        Suspended
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-ink/50">{user.email}</p>
                </div>
              </div>
              <div className="text-right text-sm text-ink/40">
                <p>{user._count.bookings} bookings · {user._count.reviews} reviews</p>
                <p>Joined {formatDate(user.createdAt)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-ink/50">
            Showing {((currentPage - 1) * 10) + 1}–{Math.min(currentPage * 10, total)} of {total}
          </p>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => updateParam('page', page === 1 ? '' : String(page))}
                className={`rounded-md px-3 py-1 text-sm font-medium ${
                  page === currentPage ? 'bg-ink text-white' : 'text-ink/60 hover:bg-ink/5'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
