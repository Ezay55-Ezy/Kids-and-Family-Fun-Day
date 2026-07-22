'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatDate } from '@/lib/format';

interface GalleryImage {
  id: string;
  title: string | null;
  description: string | null;
  imageUrl: string;
  caption: string | null;
  displayOrder: number;
  isPublished: boolean;
  eventId: string | null;
  createdAt: string;
  event: { id: string; title: string } | null;
}

interface GalleryStats {
  total: number;
  published: number;
  draft: number;
  withEvent: number;
  standalone: number;
}

const filterTabs = [
  { label: 'All', value: '' },
  { label: 'Published', value: 'published' },
  { label: 'Draft', value: 'draft' },
];

export default function AdminGalleryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [stats, setStats] = useState<GalleryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const currentStatus = searchParams.get('status') || '';
  const currentSearch = searchParams.get('query') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const fetchImages = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (currentStatus) params.set('status', currentStatus);
      if (currentSearch) params.set('query', currentSearch);
      params.set('page', String(currentPage));
      params.set('limit', '10');

      const res = await fetch(`/api/admin/gallery?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setImages(data.images);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setStats(data.stats);
    } catch {
      setError('Failed to load gallery images');
    } finally {
      setLoading(false);
    }
  }, [currentStatus, currentSearch, currentPage]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(t);
    }
  }, [success]);

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

  async function handleTogglePublish(imageId: string) {
    setTogglingId(imageId);
    setError('');
    try {
      const res = await fetch(`/api/admin/gallery/${imageId}/publish`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed');
      setImages((prev) =>
        prev.map((img) => (img.id === imageId ? { ...img, isPublished: !img.isPublished } : img))
      );
      setSuccess('Status updated');
    } catch {
      setError('Failed to toggle publish status');
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(imageId: string) {
    if (!confirm('Delete this image? This cannot be undone.')) return;
    setDeletingId(imageId);
    setError('');
    try {
      const res = await fetch(`/api/admin/gallery/${imageId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      setSuccess('Image deleted');
      fetchImages();
    } catch {
      setError('Failed to delete image');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Gallery Management</h1>
          <p className="mt-1 font-body text-ink/60">Upload and manage event gallery images</p>
        </div>
        <Link
          href="/admin/gallery/new"
          className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 transition-colors"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add Image
        </Link>
      </div>

      {success && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-3 text-sm text-green-700">{success}</div>
      )}

      {stats && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-ink/5 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-ink/50">Total Images</p>
            <p className="mt-1 text-2xl font-bold text-ink">{stats.total}</p>
          </div>
          <div className="rounded-xl border border-ink/5 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-ink/50">Published</p>
            <p className="mt-1 text-2xl font-bold text-teal-700">{stats.published}</p>
          </div>
          <div className="rounded-xl border border-ink/5 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-ink/50">Draft</p>
            <p className="mt-1 text-2xl font-bold text-amber-600">{stats.draft}</p>
          </div>
          <div className="rounded-xl border border-ink/5 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-ink/50">Event-linked</p>
            <p className="mt-1 text-2xl font-bold text-sky-600">{stats.withEvent}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 rounded-xl bg-ink/5 p-1">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => updateParam('status', tab.value)}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
                currentStatus === tab.value
                  ? 'bg-white text-ink shadow-sm'
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
            placeholder="Search images..."
            className="rounded-xl border border-ink/10 bg-white px-4 py-2 text-sm text-ink placeholder:text-ink/40 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
          <button type="submit" className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 transition-colors">
            Search
          </button>
        </form>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">{error}</div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-[4/3] animate-pulse rounded-xl bg-ink/5" />
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className="rounded-xl border border-ink/5 bg-white p-12 text-center">
          <p className="text-ink/40">No gallery images found</p>
          <Link href="/admin/gallery/new" className="mt-3 inline-block text-sm text-teal-700 hover:underline font-medium">
            Upload your first image
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => (
            <div
              key={image.id}
              className="group overflow-hidden rounded-xl border border-ink/10 bg-white transition-all hover:shadow-md"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-ink/5">
                <img
                  src={image.imageUrl}
                  alt={image.title || image.caption || ''}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                {!image.isPublished && (
                  <div className="absolute left-2 top-2">
                    <span className="inline-flex items-center rounded-full bg-slate-800 px-2.5 py-1 text-xs font-semibold text-white">
                      Draft
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink">{image.title || 'Untitled'}</p>
                  <p className="text-xs text-ink/50 mt-0.5">
                    {image.event ? `Event: ${image.event.title}` : 'Standalone'} · Order #{image.displayOrder}
                  </p>
                  <p className="text-xs text-ink/40 mt-0.5">{formatDate(image.createdAt)}</p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => handleTogglePublish(image.id)}
                    disabled={togglingId === image.id}
                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all active:scale-95 ${
                      image.isPublished
                        ? 'bg-teal-700 text-white hover:bg-teal-800'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    } disabled:opacity-50`}
                  >
                    {togglingId === image.id ? '...' : image.isPublished ? 'Published' : 'Unpublished'}
                  </button>
                  <Link
                    href={`/admin/gallery/${image.id}`}
                    className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-all active:scale-95"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(image.id)}
                    disabled={deletingId === image.id}
                    className="rounded-xl bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {deletingId === image.id ? '...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-ink/50">
            Showing {((currentPage - 1) * 10) + 1}–{Math.min(currentPage * 10, total)} of {total}
          </p>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => updateParam('page', page === 1 ? '' : String(page))}
                className={`rounded-xl px-3 py-1.5 text-sm font-semibold transition-all active:scale-95 ${
                  page === currentPage ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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
