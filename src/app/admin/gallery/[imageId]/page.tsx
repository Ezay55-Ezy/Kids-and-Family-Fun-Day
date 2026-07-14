'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import GalleryForm from '../GalleryForm';

interface GalleryData {
  id: string;
  title: string | null;
  description: string | null;
  imageUrl: string;
  caption: string | null;
  displayOrder: number;
  isPublished: boolean;
  eventId: string | null;
}

interface EventOption {
  id: string;
  title: string;
}

export default function EditGalleryImagePage() {
  const params = useParams();
  const [image, setImage] = useState<GalleryData | null>(null);
  const [events, setEvents] = useState<EventOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [imageRes, eventsRes] = await Promise.all([
          fetch(`/api/admin/gallery/${params.imageId}`),
          fetch('/api/admin/events'),
        ]);

        if (!imageRes.ok) throw new Error('Not found');
        setImage(await imageRes.json());

        if (eventsRes.ok) {
          const data = await eventsRes.json();
          setEvents(data.events?.map((e: { id: string; title: string }) => ({ id: e.id, title: e.title })) || []);
        }
      } catch {
        setError('Failed to load image');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [params.imageId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-ink/10" />
        <div className="h-64 animate-pulse rounded-xl bg-ink/5" />
      </div>
    );
  }

  if (error || !image) {
    return (
      <div className="rounded-xl border border-coral/20 bg-coral/5 p-6 text-center">
        <p className="text-coral">{error || 'Image not found'}</p>
        <Link href="/admin/gallery" className="mt-3 inline-block text-sm text-sky hover:underline">Back to gallery</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-ink">Edit Gallery Image</h1>
        <p className="mt-1 font-body text-ink/60">Update image details</p>
      </div>
      <GalleryForm
        existingData={{
          ...image,
          title: image.title || '',
          description: image.description || '',
          caption: image.caption || '',
          eventId: image.eventId || '',
        }}
        events={events}
      />
    </div>
  );
}
