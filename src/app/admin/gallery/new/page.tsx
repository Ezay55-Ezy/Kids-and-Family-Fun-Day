'use client';

import { useEffect, useState } from 'react';
import GalleryForm from '../GalleryForm';

interface EventOption {
  id: string;
  title: string;
}

export default function NewGalleryImagePage() {
  const [events, setEvents] = useState<EventOption[]>([]);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch('/api/admin/events');
        if (res.ok) {
          const data = await res.json();
          setEvents(data.events?.map((e: { id: string; title: string }) => ({ id: e.id, title: e.title })) || []);
        }
      } catch {
        // Events list unavailable — form still works without event assignment
      }
    }
    fetchEvents();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-ink">Add Gallery Image</h1>
        <p className="mt-1 font-body text-ink/60">Upload a new image to the gallery</p>
      </div>
      <GalleryForm events={events} />
    </div>
  );
}
