'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface SponsorFormData {
  companyName: string;
  slug: string;
  description: string;
  logoUrl: string;
  websiteUrl: string;
  tier: string;
  displayOrder: number;
  isPublished: boolean;
}

const tierOptions = [
  { value: 'PLATINUM', label: 'Platinum' },
  { value: 'GOLD', label: 'Gold' },
  { value: 'SILVER', label: 'Silver' },
  { value: 'BRONZE', label: 'Bronze' },
];

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function SponsorForm({ existingData }: { existingData?: SponsorFormData & { id: string } }) {
  const router = useRouter();
  const isEdit = !!existingData;

  const [form, setForm] = useState<SponsorFormData>({
    companyName: existingData?.companyName || '',
    slug: existingData?.slug || '',
    description: existingData?.description || '',
    logoUrl: existingData?.logoUrl || '',
    websiteUrl: existingData?.websiteUrl || '',
    tier: existingData?.tier || 'BRONZE',
    displayOrder: existingData?.displayOrder || 0,
    isPublished: existingData?.isPublished ?? true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  function updateField(field: keyof SponsorFormData, value: string | number | boolean) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'companyName' && !isEdit && !prev.slug) {
        next.slug = slugify(value as string);
      }
      return next;
    });
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!form.companyName.trim() || form.companyName.length < 2) errs.companyName = 'Company name is required';
    if (!form.slug.trim() || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug)) errs.slug = 'Valid slug is required (lowercase, hyphens)';
    if (form.logoUrl && !/^https?:\/\/.+/.test(form.logoUrl)) errs.logoUrl = 'Invalid URL';
    if (form.websiteUrl && !/^https?:\/\/.+/.test(form.websiteUrl)) errs.websiteUrl = 'Invalid URL';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setSaveError('');

    try {
      const url = isEdit ? `/api/admin/sponsors/${existingData.id}` : '/api/admin/sponsors';
      const method = isEdit ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          description: form.description || undefined,
          logoUrl: form.logoUrl || undefined,
          websiteUrl: form.websiteUrl || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }
      router.push('/admin/sponsors');
    } catch (err) {
      setSaveError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div>
        <label className="block text-sm font-medium text-ink">Company Name *</label>
        <input
          value={form.companyName}
          onChange={(e) => updateField('companyName', e.target.value)}
          className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 text-ink focus:border-sky focus:outline-none focus:ring-1 focus:ring-sky ${errors.companyName ? 'border-coral' : 'border-ink/10'}`}
        />
        {errors.companyName && <p className="mt-1 text-xs text-coral">{errors.companyName}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-ink">Slug *</label>
        <input
          value={form.slug}
          onChange={(e) => updateField('slug', e.target.value)}
          className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 font-mono text-sm text-ink focus:border-sky focus:outline-none focus:ring-1 focus:ring-sky ${errors.slug ? 'border-coral' : 'border-ink/10'}`}
        />
        {errors.slug && <p className="mt-1 text-xs text-coral">{errors.slug}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-ink">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => updateField('description', e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-lg border border-ink/10 bg-white px-3 py-2 text-ink focus:border-sky focus:outline-none focus:ring-1 focus:ring-sky"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-ink">Logo URL</label>
          <input
            value={form.logoUrl}
            onChange={(e) => updateField('logoUrl', e.target.value)}
            placeholder="https://..."
            className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:border-sky focus:outline-none focus:ring-1 focus:ring-sky ${errors.logoUrl ? 'border-coral' : 'border-ink/10'}`}
          />
          {errors.logoUrl && <p className="mt-1 text-xs text-coral">{errors.logoUrl}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-ink">Website URL</label>
          <input
            value={form.websiteUrl}
            onChange={(e) => updateField('websiteUrl', e.target.value)}
            placeholder="https://..."
            className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:border-sky focus:outline-none focus:ring-1 focus:ring-sky ${errors.websiteUrl ? 'border-coral' : 'border-ink/10'}`}
          />
          {errors.websiteUrl && <p className="mt-1 text-xs text-coral">{errors.websiteUrl}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-ink">Tier</label>
          <select
            value={form.tier}
            onChange={(e) => updateField('tier', e.target.value)}
            className="mt-1 w-full rounded-lg border border-ink/10 bg-white px-3 py-2 text-ink focus:border-sky focus:outline-none focus:ring-1 focus:ring-sky"
          >
            {tierOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-ink">Display Order</label>
          <input
            type="number"
            value={form.displayOrder}
            onChange={(e) => updateField('displayOrder', parseInt(e.target.value) || 0)}
            className="mt-1 w-full rounded-lg border border-ink/10 bg-white px-3 py-2 text-ink focus:border-sky focus:outline-none focus:ring-1 focus:ring-sky"
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
          disabled={saving}
          className="rounded-lg bg-ink px-5 py-2 text-sm font-medium text-white hover:bg-ink/90 disabled:opacity-50"
        >
          {saving ? 'Saving...' : isEdit ? 'Update Sponsor' : 'Create Sponsor'}
        </button>
        <Link
          href="/admin/sponsors"
          className="rounded-lg border border-ink/10 bg-white px-5 py-2 text-sm font-medium text-ink/60 hover:bg-ink/5"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
