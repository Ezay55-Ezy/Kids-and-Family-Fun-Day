'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const categories = [
  { value: 'CATERING', label: 'Catering' },
  { value: 'PHOTOGRAPHY', label: 'Photography' },
  { value: 'ENTERTAINMENT', label: 'Entertainment' },
  { value: 'DECORATIONS', label: 'Decorations' },
  { value: 'EQUIPMENT_RENTAL', label: 'Equipment Rental' },
  { value: 'KIDS_ACTIVITIES', label: 'Kids Activities' },
  { value: 'TRANSPORT', label: 'Transport' },
  { value: 'OTHER', label: 'Other' },
];

const pricingTypes = [
  { value: 'FIXED', label: 'Fixed Price' },
  { value: 'STARTING_FROM', label: 'Starting From' },
  { value: 'CONTACT_VENDOR', label: 'Contact Vendor' },
];

interface ServiceData {
  id: string;
  name: string;
  shortDescription: string | null;
  description: string;
  category: string | null;
  price: number;
  pricingType: string;
  imageUrl: string | null;
  isActive: boolean;
}

export default function EditServicePage() {
  const params = useParams();
  const router = useRouter();
  const [service, setService] = useState<ServiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
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
      setImageUrl(data.url);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  useEffect(() => {
    async function fetchService() {
      try {
        const res = await fetch(`/api/vendor/services/${params.serviceId}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setService(data.service);
        setImageUrl(data.service.imageUrl || '');
      } catch {
        setError('Failed to load service.');
      } finally {
        setLoading(false);
      }
    }
    fetchService();
  }, [params.serviceId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const body: Record<string, unknown> = {
      name: formData.get('name'),
      shortDescription: formData.get('shortDescription') || null,
      description: formData.get('description'),
      category: formData.get('category') || null,
      price: formData.get('price') ? Number(formData.get('price')) : undefined,
      pricingType: formData.get('pricingType') || undefined,
      imageUrl: imageUrl || null,
    };

    try {
      const res = await fetch(`/api/vendor/services/${params.serviceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong.');
        return;
      }

      router.push('/vendor/services');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl space-y-6">
        <div className="h-6 w-48 rounded bg-ink/5 animate-pulse" />
        <div className="h-8 w-64 rounded bg-ink/5 animate-pulse" />
        <div className="h-96 rounded-xl bg-ink/5 animate-pulse" />
      </div>
    );
  }

  if (error || !service) {
    return (
      <div>
        <Link
          href="/vendor/services"
          className="inline-flex text-sm text-ink/50 hover:text-ink transition-colors"
        >
          &larr; Back to services
        </Link>
        <div className="mt-6 rounded-xl bg-coral/10 border border-coral/20 p-4 text-sm text-coral">
          {error || 'Service not found.'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Link
        href="/vendor/services"
        className="inline-flex text-sm text-ink/50 hover:text-ink transition-colors"
      >
        &larr; Back to services
      </Link>

      <h2 className="font-display font-semibold text-2xl text-ink">Edit Service</h2>

      {error && (
        <div className="rounded-xl bg-coral/10 border border-coral/20 p-4 text-sm text-coral">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-ink mb-1.5">
            Service Name *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            maxLength={100}
            defaultValue={service.name}
            className="input-field w-full"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-ink mb-1.5">
            Category
          </label>
          <select
            id="category"
            name="category"
            className="input-field w-full"
            defaultValue={service.category || ''}
          >
            <option value="">Select a category</option>
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="shortDescription" className="block text-sm font-medium text-ink mb-1.5">
            Short Description
          </label>
          <input
            id="shortDescription"
            name="shortDescription"
            type="text"
            maxLength={200}
            defaultValue={service.shortDescription || ''}
            className="input-field w-full"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-ink mb-1.5">
            Full Description *
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={5}
            maxLength={2000}
            defaultValue={service.description}
            className="input-field w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">
            Service Image
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="input-field flex-1"
              placeholder="Paste URL or upload below"
            />
            <label className="cursor-pointer rounded-lg border border-ink/10 bg-paper px-4 py-2 text-sm font-medium text-ink/60 hover:bg-ink/5 shrink-0">
              {uploading ? 'Uploading...' : 'Upload'}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
          {imageUrl && (
            <img src={imageUrl} alt="Preview" className="mt-3 max-h-48 w-full rounded-lg object-cover bg-ink/5" />
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="pricingType" className="block text-sm font-medium text-ink mb-1.5">
              Pricing Type *
            </label>
            <select
              id="pricingType"
              name="pricingType"
              className="input-field w-full"
              defaultValue={service.pricingType}
            >
              {pricingTypes.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-ink mb-1.5">
              Price (KSh) *
            </label>
            <input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              required
              defaultValue={service.price}
              className="input-field w-full"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary disabled:opacity-50"
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
          <Link
            href="/vendor/services"
            className="text-sm font-medium text-ink/50 hover:text-ink transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
