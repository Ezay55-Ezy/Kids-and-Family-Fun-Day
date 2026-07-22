'use client';

import { useState, useRef, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';

interface EventFormData {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  location: string;
  bannerImageUrl: string;
  capacity: string;
  registrationOpenDate: string;
  registrationCloseDate: string;
  status: string;
}

interface FormErrors {
  [key: string]: string | undefined;
}

interface EventFormProps {
  initialData?: Partial<EventFormData> & { id?: string };
  mode: 'create' | 'edit';
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200);
}

export default function EventForm({ initialData, mode }: EventFormProps) {
  const router = useRouter();
  const isEdit = mode === 'edit';

  const [formData, setFormData] = useState<EventFormData>({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    shortDescription: initialData?.shortDescription || '',
    description: initialData?.description || '',
    startDate: initialData?.startDate || '',
    startTime: initialData?.startTime || '',
    endDate: initialData?.endDate || '',
    endTime: initialData?.endTime || '',
    location: initialData?.location || '',
    bannerImageUrl: initialData?.bannerImageUrl || '',
    capacity: initialData?.capacity || '',
    registrationOpenDate: initialData?.registrationOpenDate || '',
    registrationCloseDate: initialData?.registrationCloseDate || '',
    status: initialData?.status || 'DRAFT',
  });

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title: value,
      slug: slugManuallyEdited ? prev.slug : generateSlug(value),
    }));
    if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
  };

  const handleSlugChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSlugManuallyEdited(true);
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, slug: value }));
    if (errors.slug) setErrors((prev) => ({ ...prev, slug: undefined }));
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  async function handleBannerUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Upload failed');
      }
      const data = await res.json();
      setFormData((prev) => ({ ...prev, bannerImageUrl: data.url }));
    } catch (err) {
      setSubmitError((err as Error).message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim() || formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formData.slug)) {
      newErrors.slug = 'Slug must be lowercase with hyphens only';
    }

    if (!formData.description.trim() || formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (!formData.location.trim() || formData.location.trim().length < 3) {
      newErrors.location = 'Location is required';
    }

    if (!formData.capacity || parseInt(formData.capacity) < 1) {
      newErrors.capacity = 'Capacity must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError('');
    setSuccessMessage('');

    if (!validate()) return;

    setIsLoading(true);

    const payload = {
      ...formData,
      capacity: parseInt(formData.capacity),
    };

    try {
      const url = isEdit
        ? `/api/admin/events/${initialData!.id}`
        : '/api/admin/events';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setErrors((prev) => ({ ...prev, slug: data.error }));
        } else if (res.status === 400 && data.details) {
          const fieldErrors: FormErrors = {};
          const field = data.details.fieldErrors;
          for (const key of Object.keys(field)) {
            fieldErrors[key] = field[key]?.[0];
          }
          setErrors(fieldErrors);
        } else {
          setSubmitError(data.error || 'Something went wrong. Please try again.');
        }
        return;
      }

      if (isEdit) {
        setSuccessMessage('Event updated successfully.');
      } else {
        router.push('/admin/events');
        router.refresh();
      }
    } catch {
      setSubmitError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = (name: string) =>
    `input-base ${errors[name] ? 'input-error' : ''}`;

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-8" noValidate>
      <div className="rounded-xl bg-paper border border-ink/10 shadow-soft p-6 space-y-6">
        <h3 className="font-display font-semibold text-lg text-ink">Basic Information</h3>

        <div>
          <label htmlFor="title" className="label-base">Event title</label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleTitleChange}
            className={inputClass('title')}
            placeholder="Kids & Family Fun Day 2026"
          />
          {errors.title && <p className="mt-1.5 text-sm text-coral">{errors.title}</p>}
        </div>

        <div>
          <label htmlFor="slug" className="label-base">Slug</label>
          <input
            id="slug"
            name="slug"
            type="text"
            value={formData.slug}
            onChange={handleSlugChange}
            className={inputClass('slug')}
            placeholder="kids-family-fun-day-2026"
          />
          {errors.slug && <p className="mt-1.5 text-sm text-coral">{errors.slug}</p>}
          {!slugManuallyEdited && (
            <p className="mt-1 text-xs text-ink/40">Auto-generated from title. Edit to override.</p>
          )}
        </div>

        <div>
          <label htmlFor="shortDescription" className="label-base">Short description</label>
          <input
            id="shortDescription"
            name="shortDescription"
            type="text"
            value={formData.shortDescription}
            onChange={handleChange}
            className={inputClass('shortDescription')}
            placeholder="A brief summary for cards and listings"
          />
        </div>

        <div>
          <label htmlFor="description" className="label-base">Full description</label>
          <textarea
            id="description"
            name="description"
            rows={5}
            value={formData.description}
            onChange={handleChange}
            className={`${inputClass('description')} resize-y min-h-[120px]`}
            placeholder="Detailed description of the event..."
          />
          {errors.description && <p className="mt-1.5 text-sm text-coral">{errors.description}</p>}
        </div>
      </div>

      <div className="rounded-xl bg-paper border border-ink/10 shadow-soft p-6 space-y-6">
        <h3 className="font-display font-semibold text-lg text-ink">Date & Location</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="startDate" className="label-base">Start date</label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              className={inputClass('startDate')}
            />
            {errors.startDate && <p className="mt-1.5 text-sm text-coral">{errors.startDate}</p>}
          </div>
          <div>
            <label htmlFor="startTime" className="label-base">Start time (optional)</label>
            <input
              id="startTime"
              name="startTime"
              type="time"
              value={formData.startTime}
              onChange={handleChange}
              className={inputClass('startTime')}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="endDate" className="label-base">End date</label>
            <input
              id="endDate"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              className={inputClass('endDate')}
            />
            {errors.endDate && <p className="mt-1.5 text-sm text-coral">{errors.endDate}</p>}
          </div>
          <div>
            <label htmlFor="endTime" className="label-base">End time (optional)</label>
            <input
              id="endTime"
              name="endTime"
              type="time"
              value={formData.endTime}
              onChange={handleChange}
              className={inputClass('endTime')}
            />
          </div>
        </div>

        <div>
          <label htmlFor="location" className="label-base">Venue / Location</label>
          <input
            id="location"
            name="location"
            type="text"
            value={formData.location}
            onChange={handleChange}
            className={inputClass('location')}
            placeholder="Nairobi, Kenya"
          />
          {errors.location && <p className="mt-1.5 text-sm text-coral">{errors.location}</p>}
        </div>
      </div>

      <div className="rounded-xl bg-paper border border-ink/10 shadow-soft p-6 space-y-6">
        <h3 className="font-display font-semibold text-lg text-ink">Media & Capacity</h3>

        <div>
          <label htmlFor="bannerImageUrl" className="label-base">Cover image</label>
          <div className="mt-1 flex gap-2">
            <input
              id="bannerImageUrl"
              name="bannerImageUrl"
              type="text"
              value={formData.bannerImageUrl}
              onChange={handleChange}
              className={`flex-1 rounded-lg border bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:border-sky focus:outline-none focus:ring-1 focus:ring-sky ${errors.bannerImageUrl ? 'border-coral' : 'border-ink/10'}`}
              placeholder="Paste URL or upload below"
            />
            <label className="cursor-pointer rounded-lg border border-ink/10 bg-paper px-4 py-2 text-sm font-medium text-ink/60 hover:bg-ink/5 shrink-0">
              {uploading ? 'Uploading...' : 'Upload'}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleBannerUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
          {formData.bannerImageUrl && (
            <img src={formData.bannerImageUrl} alt="Banner preview" className="mt-3 max-h-48 w-full rounded-lg object-cover bg-ink/5" />
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="capacity" className="label-base">Maximum attendees</label>
            <input
              id="capacity"
              name="capacity"
              type="number"
              min="1"
              value={formData.capacity}
              onChange={handleChange}
              className={inputClass('capacity')}
              placeholder="1000"
            />
            {errors.capacity && <p className="mt-1.5 text-sm text-coral">{errors.capacity}</p>}
          </div>
          <div>
            <label htmlFor="status" className="label-base">Publication status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={inputClass('status')}
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-paper border border-ink/10 shadow-soft p-6 space-y-6">
        <h3 className="font-display font-semibold text-lg text-ink">Registration Window</h3>
        <p className="text-sm text-ink/50">Set when registration opens and closes. Leave blank for no restriction.</p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="registrationOpenDate" className="label-base">Registration opens</label>
            <input
              id="registrationOpenDate"
              name="registrationOpenDate"
              type="datetime-local"
              value={formData.registrationOpenDate}
              onChange={handleChange}
              className={inputClass('registrationOpenDate')}
            />
          </div>
          <div>
            <label htmlFor="registrationCloseDate" className="label-base">Registration closes</label>
            <input
              id="registrationCloseDate"
              name="registrationCloseDate"
              type="datetime-local"
              value={formData.registrationCloseDate}
              onChange={handleChange}
              className={inputClass('registrationCloseDate')}
            />
          </div>
        </div>
      </div>

      {submitError && (
        <div className="rounded-lg bg-coral/10 border border-coral/20 p-3 text-sm text-coral" role="alert">
          {submitError}
        </div>
      )}

      {successMessage && (
        <div className="rounded-lg bg-grass/10 border border-grass/20 p-3 text-sm text-grass" role="alert">
          {successMessage}
        </div>
      )}

      <div className="flex items-center gap-4">
        <button type="submit" className="btn-primary" disabled={isLoading} aria-busy={isLoading}>
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {isEdit ? 'Saving...' : 'Creating...'}
            </>
          ) : (
            isEdit ? 'Save changes' : 'Create event'
          )}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
