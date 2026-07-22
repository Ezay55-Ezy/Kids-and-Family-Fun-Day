'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import ImageLightbox from '@/components/gallery/ImageLightbox';

interface GalleryImage {
  id: string;
  title: string | null;
  description: string | null;
  imageUrl: string;
  caption: string | null;
  displayOrder: number;
  createdAt: string;
  event: { id: string; title: string; slug: string } | null;
}

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    async function fetchImages() {
      try {
        const res = await fetch('/api/gallery?limit=50');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setImages(data.images ?? data);
      } catch {
        setError('Failed to load gallery');
      } finally {
        setLoading(false);
      }
    }
    fetchImages();
  }, []);

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  const navigateLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
  }, []);

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-ink/10 bg-paper/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 font-display font-bold text-xl text-ink"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-coral text-paper font-body text-sm font-semibold">
              KF
            </span>
            <span className="hidden sm:block">Kids & Family Fun Day Kenya</span>
          </Link>
          <nav className="flex gap-6 text-sm font-medium text-ink/60">
            <Link href="/events" className="hover:text-ink">Events</Link>
            <Link href="/gallery" className="text-ink">Gallery</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h1 className="font-display text-4xl font-bold text-ink">Gallery</h1>
          <p className="mt-3 text-lg text-ink/60">Moments from our events and activities</p>
        </div>

        {error && (
          <div className="rounded-lg bg-coral/10 p-4 text-center text-coral">{error}</div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] animate-pulse rounded-xl bg-ink/5" />
            ))}
          </div>
        ) : images.length === 0 ? (
          <div className="rounded-xl border border-ink/10 bg-white p-16 text-center">
            <p className="text-lg text-ink/40">No gallery images yet</p>
            <Link href="/events" className="mt-4 inline-block text-sm text-sky hover:underline">
              Browse upcoming events
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {images.map((image, idx) => (
              <button
                key={image.id}
                onClick={() => openLightbox(idx)}
                className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-ink/5"
              >
                <img
                  src={image.imageUrl}
                  alt={image.title || image.caption || ''}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-ink/0 transition-colors group-hover:bg-ink/20" />
                {(image.title || image.caption || image.event) && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/60 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                    <p className="text-xs font-medium text-paper">{image.title || image.caption}</p>
                    {image.event && (
                      <p className="text-xs text-paper/70 mt-0.5">{image.event.title}</p>
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </main>

      <ImageLightbox
        images={images}
        currentIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={closeLightbox}
        onNavigate={navigateLightbox}
      />
    </div>
  );
}
