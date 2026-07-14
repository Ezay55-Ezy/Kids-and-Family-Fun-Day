'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import SponsorForm from '../SponsorForm';

interface SponsorData {
  id: string;
  companyName: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  websiteUrl: string | null;
  tier: string;
  displayOrder: number;
  isPublished: boolean;
  userId: string | null;
}

export default function EditSponsorPage() {
  const params = useParams();
  const router = useRouter();
  const [sponsor, setSponsor] = useState<SponsorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchSponsor() {
      try {
        const res = await fetch(`/api/admin/sponsors/${params.sponsorId}`);
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        setSponsor(data);
      } catch {
        setError('Failed to load sponsor');
      } finally {
        setLoading(false);
      }
    }
    fetchSponsor();
  }, [params.sponsorId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-ink/10" />
        <div className="h-64 animate-pulse rounded-xl bg-ink/5" />
      </div>
    );
  }

  if (error || !sponsor) {
    return (
      <div className="rounded-xl border border-coral/20 bg-coral/5 p-6 text-center">
        <p className="text-coral">{error || 'Sponsor not found'}</p>
        <Link href="/admin/sponsors" className="mt-3 inline-block text-sm text-sky hover:underline">Back to sponsors</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-ink">Edit Sponsor</h1>
        <p className="mt-1 font-body text-ink/60">Update {sponsor.companyName}</p>
      </div>
      <SponsorForm
        existingData={{
          ...sponsor,
          description: sponsor.description || '',
          logoUrl: sponsor.logoUrl || '',
          websiteUrl: sponsor.websiteUrl || '',
        }}
      />
    </div>
  );
}
