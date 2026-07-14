'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface GalleryFormData {
  title: string;
  description: string;
  imageUrl: string;
  caption: string;
  eventId: string;
  displayOrder: number;
  isPublished: boolean;
}

interface EventOption {
  id: string;
  title: string;
}

export default function GalleryForm({
  existingData,
  events,
}: {
  existingData?: GalleryFormData & { id: string };
  events: EventOption[];
}) {
  const router = useRouter();
  const isEdit = !!existingData;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<GalleryFormData>({
    title: existingData?.title || '',
    description: existingData?.description || '',
    imageUrl: existingData?.imageUrl || '',
    caption: existingData?.caption || '',
    eventId: existingData?.eventId || '',
    displayOrder: existingData?.displayOrder || 0,
    isPublished: existingData?.isPublished ?? true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saveError, setSaveError] = useState('');

  function updateField(field: keyof GalleryFormData, value: string | number | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Upload failed');
      }
      const data = await res.json();
      updateField('imageUrl', data.url);
    } catch (err) {
      setSaveError((err as Error).message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!form.imageUrl.trim()) errs.imageUrl = 'Image URL is required';
    if (form.title && form.title.length > 200) errs.title = 'Title must be under 200 characters';
    if (form.description && form.description.length > 1000) errs.description = 'Description must be under 1000 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setSaveError('');

    try {
      const url = isEdit ? `/api/admin/gallery/${existingData.id}` : '/api/admin/gallery';
      const method = isEdit ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          title: form.title || undefined,
          description: form.description || undefined,
          caption: form.caption || undefined,
          eventId: form.eventId || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }
      router.push('/admin/gallery');
    } catch (err) {
      setSaveError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div>
        <label className="block text-sm font-medium text-ink">Image *</label>
        <div className="mt-1 flex gap-3">
          <input
            value={form.imageUrl}
            onChange={(e) => updateField('imageUrl', e.target.value)}
            placeholder="https://... or upload below"
            className={`flex-1 rounded-lg border bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:border-sky focus:outline-none focus:ring-1 focus:ring-sky ${errors.imageUrl ? 'border-coral' : 'border-ink/10'}`}
          />
          <label className="cursor-pointer rounded-lg border border-ink/10 bg-paper px-4 py-2 text-sm font-medium text-ink/60 hover:bg-ink/5">
            {uploading ? 'Uploading...' : 'Upload'}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
        {errors.imageUrl && <p className="mt-1 text-xs text-coral">{errors.imageUrl}</p>}
        {form.imageUrl && (
          <div className="mt-2 overflow-hidden rounded-lg border border-ink/10">
            <img src={form.imageUrl} alt="Preview" className="max-h-48 w-full object-contain bg-ink/5" />
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-ink">Title</label>
        <input
          value={form.title}
          onChange={(e) => updateField('title', e.target.value)}
          placeholder="Optional title"
          className={`mt-1 w-full rounded-lg border bg-paper px-3 py-2 text-ink placeholder:text-ink/40 focus:border-sky focus:outline-none focus:ring-1 focus:ring-sky ${errors.title ? 'border-coral' : 'border-ink/10'}`}
        />
        {errors.title && <p className="mt-1 text-xs text-coral">{errors.title}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-ink">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => updateField('description', e.target.value)}
          rows={3}
          placeholder="Optional description"
          className={`mt-1 w-full rounded-lg border bg-paper px-3 py-2 text-ink placeholder:text-ink/40 focus:border-sky focus:outline-none focus:ring-1 focus:ring-sky ${errors.description ? 'border-coral' : 'border-ink/10'}`}
        />
        {errors.description && <p className="mt-1 text-xs text-coral">{errors.description}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-ink">Caption</label>
        <input
          value={form.caption}
          onChange={(e) => updateField('caption', e.target.value)}
          placeholder="Short caption (shown on hover)"
          className="mt-1 w-full rounded-lg border border-ink/10 bg-paper px-3 py-2 text-ink placeholder:text-ink/40 focus:border-sky focus:outline-none focus:ring-1 focus:ring-sky"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-ink">Event</label>
          <select
            value={form.eventId}
            onChange={(e) => updateField('eventId', e.target.value)}
            className="mt-1 w-full rounded-lg border border-ink/10 bg-paper px-3 py-2 text-ink focus:border-sky focus:outline-none focus:ring-1 focus:ring-sky"
          >
            <option value="">No event (standalone)</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>{event.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-ink">Display Order</label>
          <input
            type="number"
            value={form.displayOrder}
            onChange={(e) => updateField('displayOrder', parseInt(e.target.value) || 0)}
            className="mt-1 w-full rounded-lg border border-ink/10 bg-paper px-3 py-2 text-ink focus:border-sky focus:outline-none focus:ring-1 focus:ring-sky"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className="relative inline-flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={(e) => updateField('isPublished', e.target.checked)}
            className="peer sr-only"
          />
          <div className="h-5 w-9 rounded-full bg-ink/20 transition-colors peer-checked:bg-grass" />
          <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-4" />
          <span className="text-sm text-ink">Published</span>
        </label>
      </div>

      {saveError && (
        <div className="rounded-lg bg-coral/10 p-3 text-sm text-coral">{saveError}</div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving || uploading}
          className="rounded-lg bg-ink px-5 py-2 text-sm font-medium text-white hover:bg-ink/90 disabled:opacity-50"
        >
          {saving ? 'Saving...' : isEdit ? 'Update Image' : 'Add Image'}
        </button>
        <Link
          href="/admin/gallery"
          className="rounded-lg border border-ink/10 bg-paper px-5 py-2 text-sm font-medium text-ink/60 hover:bg-ink/5"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
