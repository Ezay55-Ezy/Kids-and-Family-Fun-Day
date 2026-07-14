'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { formatDate } from '@/lib/format';

interface ServiceItem {
  id: string;
  name: string;
  shortDescription: string | null;
  description: string;
  category: string | null;
  price: number;
  pricingType: string;
  isActive: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

const categoryLabels: Record<string, string> = {
  CATERING: 'Catering',
  PHOTOGRAPHY: 'Photography',
  ENTERTAINMENT: 'Entertainment',
  DECORATIONS: 'Decorations',
  EQUIPMENT_RENTAL: 'Equipment Rental',
  KIDS_ACTIVITIES: 'Kids Activities',
  TRANSPORT: 'Transport',
  OTHER: 'Other',
};

const pricingLabels: Record<string, string> = {
  FIXED: 'Fixed Price',
  STARTING_FROM: 'Starting From',
  CONTACT_VENDOR: 'Contact Vendor',
};

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
  }).format(price);
}

export default function VendorServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/vendor/services');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setServices(data.services);
    } catch {
      setError('Failed to load services.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const [confirmArchive, setConfirmArchive] = useState<string | null>(null);

  const handleAction = async (serviceId: string, action: 'publish' | 'unpublish' | 'archive') => {
    if (action === 'archive' && confirmArchive !== serviceId) {
      setConfirmArchive(serviceId);
      return;
    }
    setConfirmArchive(null);
    try {
      const res = await fetch(`/api/vendor/services/${serviceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        fetchServices();
      }
    } catch {
      // silently fail
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-xl bg-ink/5 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-coral/10 border border-coral/20 p-4 text-sm text-coral">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-semibold text-2xl text-ink">My Services</h2>
        <Link href="/vendor/services/new" className="btn-primary text-sm">
          Add Service
        </Link>
      </div>

      {services.length === 0 ? (
        <div className="rounded-xl bg-paper border border-ink/10 p-12 text-center">
          <svg className="h-12 w-12 mx-auto text-ink/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          </svg>
          <h3 className="mt-4 font-display font-semibold text-lg text-ink">No services yet</h3>
          <p className="mt-1 text-sm text-ink/50">Create your first service to start offering it at events.</p>
          <Link
            href="/vendor/services/new"
            className="btn-primary mt-6 inline-flex"
          >
            Add Service
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {services.map((service) => (
            <div
              key={service.id}
              className="rounded-xl bg-paper border border-ink/10 shadow-soft overflow-hidden"
            >
              <div className="flex items-center gap-4 p-4 md:p-6">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display font-semibold text-base text-ink">
                      {service.name}
                    </h3>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        service.isActive
                          ? 'bg-grass/10 text-grass'
                          : 'bg-ink/10 text-ink/50'
                      }`}
                    >
                      {service.isActive ? 'Published' : 'Unpublished'}
                    </span>
                    {service.category && (
                      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-sky/10 text-sky">
                        {categoryLabels[service.category] || service.category}
                      </span>
                    )}
                  </div>
                  {service.shortDescription && (
                    <p className="mt-1 text-sm text-ink/50 line-clamp-1">
                      {service.shortDescription}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-ink/40">
                    <span>{formatPrice(service.price)}</span>
                    <span>{pricingLabels[service.pricingType] || service.pricingType}</span>
                    <span>Created {formatDate(service.createdAt)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/vendor/services/${service.id}/edit`}
                    className="text-xs font-medium text-ink/50 hover:text-ink transition-colors"
                  >
                    Edit
                  </Link>
                  {service.isActive ? (
                    <button
                      type="button"
                      onClick={() => handleAction(service.id, 'unpublish')}
                      className="text-xs font-medium text-ink/50 hover:text-ink transition-colors"
                    >
                      Unpublish
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleAction(service.id, 'publish')}
                      className="text-xs font-medium text-grass hover:text-grass/80 transition-colors"
                    >
                      Publish
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleAction(service.id, 'archive')}
                    className={`text-xs font-medium transition-colors ${
                      confirmArchive === service.id
                        ? 'text-coral font-semibold'
                        : 'text-coral/60 hover:text-coral'
                    }`}
                  >
                    {confirmArchive === service.id ? 'Confirm Archive' : 'Archive'}
                  </button>
                  {confirmArchive === service.id && (
                    <button
                      type="button"
                      onClick={() => setConfirmArchive(null)}
                      className="text-xs font-medium text-ink/40 hover:text-ink transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
