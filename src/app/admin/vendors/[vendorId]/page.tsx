'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatDate } from '@/lib/format';

interface VendorUser {
  id: string;
  name: string | null;
  email: string | null;
}

interface VendorService {
  id: string;
  name: string;
  description: string;
  price: number;
  isActive: boolean;
}

interface VendorDetail {
  id: string;
  businessName: string;
  description: string;
  status: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  approvedAt: string | null;
  activationDate: string | null;
  paymentVerifiedAt: string | null;
  rejectedReason: string | null;
  user: VendorUser;
  services: VendorService[];
}

const statusStyles: Record<string, string> = {
  PENDING_REVIEW: 'bg-sun/10 text-sun ring-sun/20',
  APPROVED_AWAITING_PAYMENT: 'bg-sky/10 text-sky ring-sky/20',
  ACTIVE: 'bg-grass/10 text-grass ring-grass/20',
  REJECTED: 'bg-coral/10 text-coral ring-coral/20',
};

const statusLabels: Record<string, string> = {
  PENDING_REVIEW: 'Pending Review',
  APPROVED_AWAITING_PAYMENT: 'Awaiting Payment',
  ACTIVE: 'Active',
  REJECTED: 'Rejected',
};

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
  }).format(price);
}

export default function VendorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [vendor, setVendor] = useState<VendorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [action, setAction] = useState<'approve' | 'reject' | 'activate' | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function fetchVendor() {
      try {
        const res = await fetch(`/api/admin/vendors/${params.vendorId}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setVendor(data.vendor);
      } catch {
        setError('Failed to load vendor application.');
      } finally {
        setLoading(false);
      }
    }
    fetchVendor();
  }, [params.vendorId]);

  const handleAction = async (a: 'approve' | 'reject' | 'activate') => {
    if (a === 'reject' && !rejectReason.trim()) return;

    setSubmitting(true);
    setServerError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/admin/vendors/${params.vendorId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: a,
          reason: a === 'reject' ? rejectReason.trim() : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error || 'Something went wrong.');
        return;
      }

      setSuccess(
        a === 'approve'
          ? 'Vendor application approved. Awaiting payment.'
          : a === 'activate'
            ? 'Vendor account activated.'
            : 'Vendor application rejected.',
      );
      setAction(null);
      setRejectReason('');

      const refreshRes = await fetch(`/api/admin/vendors/${params.vendorId}`);
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        setVendor(refreshData.vendor);
      }
    } catch {
      setServerError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 rounded bg-ink/5 animate-pulse" />
        <div className="h-32 rounded-xl bg-ink/5 animate-pulse" />
        <div className="h-32 rounded-xl bg-ink/5 animate-pulse" />
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div>
        <Link
          href="/admin/vendors"
          className="text-sm text-ink/50 hover:text-ink transition-colors"
        >
          &larr; Back to vendor applications
        </Link>
        <div className="mt-6 rounded-xl bg-coral/10 border border-coral/20 p-4 text-sm text-coral">
          {error || 'Vendor not found.'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <Link
        href="/admin/vendors"
        className="inline-flex text-sm text-ink/50 hover:text-ink transition-colors"
      >
        &larr; Back to vendor applications
      </Link>

      {success && (
        <div className="rounded-xl bg-grass/10 border border-grass/20 p-4 text-sm text-grass">
          {success}
        </div>
      )}

      {serverError && (
        <div className="rounded-xl bg-coral/10 border border-coral/20 p-4 text-sm text-coral">
          {serverError}
        </div>
      )}

      <div className="rounded-xl bg-paper border border-ink/10 shadow-soft overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-display font-bold text-2xl text-ink">{vendor.businessName}</h1>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${statusStyles[vendor.status] || ''}`}>
                  {statusLabels[vendor.status] || vendor.status}
                </span>
              </div>
              <p className="mt-2 text-sm text-ink/60 max-w-prose">{vendor.description}</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="block text-ink/40 text-xs font-medium uppercase tracking-wider">Applicant</span>
              <span className="block mt-1 text-ink">{vendor.user.name || 'N/A'}</span>
            </div>
            <div>
              <span className="block text-ink/40 text-xs font-medium uppercase tracking-wider">Email</span>
              <span className="block mt-1 text-ink">{vendor.user.email || 'N/A'}</span>
            </div>
            <div>
              <span className="block text-ink/40 text-xs font-medium uppercase tracking-wider">Applied</span>
              <span className="block mt-1 text-ink">{formatDate(vendor.createdAt)}</span>
            </div>
            <div>
              <span className="block text-ink/40 text-xs font-medium uppercase tracking-wider">Last Updated</span>
              <span className="block mt-1 text-ink">{formatDate(vendor.updatedAt)}</span>
            </div>
            {vendor.approvedAt && (
              <div>
                <span className="block text-ink/40 text-xs font-medium uppercase tracking-wider">Approved</span>
                <span className="block mt-1 text-ink">{formatDate(vendor.approvedAt)}</span>
              </div>
            )}
            {vendor.activationDate && (
              <div>
                <span className="block text-ink/40 text-xs font-medium uppercase tracking-wider">Activated</span>
                <span className="block mt-1 text-ink">{formatDate(vendor.activationDate)}</span>
              </div>
            )}
            {vendor.paymentVerifiedAt && (
              <div>
                <span className="block text-ink/40 text-xs font-medium uppercase tracking-wider">Payment Verified</span>
                <span className="block mt-1 text-ink">{formatDate(vendor.paymentVerifiedAt)}</span>
              </div>
            )}
            {vendor.rejectedReason && (
              <div className="sm:col-span-2">
                <span className="block text-ink/40 text-xs font-medium uppercase tracking-wider">Rejection Reason</span>
                <span className="block mt-1 text-ink">{vendor.rejectedReason}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {vendor.services.length > 0 && (
        <div className="rounded-xl bg-paper border border-ink/10 shadow-soft overflow-hidden">
          <div className="px-6 py-4 border-b border-ink/5">
            <h2 className="font-display font-semibold text-lg text-ink">Services</h2>
          </div>
          <div className="divide-y divide-ink/5">
            {vendor.services.map((service) => (
              <div key={service.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-ink">{service.name}</h3>
                  <span className="text-sm font-medium text-ink">{formatPrice(service.price)}</span>
                </div>
                <p className="mt-1 text-sm text-ink/50">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {vendor.status === 'PENDING_REVIEW' && (
        <div className="rounded-xl bg-paper border border-ink/10 shadow-soft overflow-hidden">
          <div className="px-6 py-4 border-b border-ink/5">
            <h2 className="font-display font-semibold text-lg text-ink">Review Application</h2>
          </div>
          <div className="p-6 space-y-4">
            {!action && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setAction('approve')}
                  className="btn-primary text-sm"
                >
                  Approve Application
                </button>
                <button
                  type="button"
                  onClick={() => setAction('reject')}
                  className="btn-secondary text-sm text-coral border-coral/30 hover:bg-coral/5"
                >
                  Reject Application
                </button>
              </div>
            )}

            {action === 'approve' && (
              <div className="space-y-3 rounded-lg bg-grass/5 border border-grass/20 p-4">
                <p className="text-sm text-ink">
                  Approve <strong>{vendor.businessName}</strong>{'\''}s application? They will need to complete the participation fee before their account becomes active.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAction('approve')}
                    disabled={submitting}
                    className="btn-primary text-sm disabled:opacity-50"
                  >
                    {submitting ? 'Approving...' : 'Confirm Approval'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAction(null)}
                    className="text-sm font-medium text-ink/50 hover:text-ink"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {action === 'reject' && (
              <div className="space-y-3 rounded-lg bg-coral/5 border border-coral/20 p-4">
                <p className="text-sm text-ink">
                  Reject <strong>{vendor.businessName}</strong>{'\''}s application?
                </p>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Provide a reason for rejection..."
                  rows={3}
                  className="input-field text-sm w-full"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAction('reject')}
                    disabled={submitting || !rejectReason.trim()}
                    className="btn-primary text-sm bg-coral hover:bg-coral/90 disabled:opacity-50"
                  >
                    {submitting ? 'Rejecting...' : 'Confirm Rejection'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAction(null);
                      setRejectReason('');
                    }}
                    className="text-sm font-medium text-ink/50 hover:text-ink"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {vendor.status === 'APPROVED_AWAITING_PAYMENT' && (
        <div className="rounded-xl bg-paper border border-ink/10 shadow-soft overflow-hidden">
          <div className="px-6 py-4 border-b border-ink/5">
            <h2 className="font-display font-semibold text-lg text-ink">Activate Vendor</h2>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-sm text-ink/70">
              The vendor has been approved and is awaiting participation fee payment. Verify payment receipt and activate their account.
            </p>
            {!action ? (
              <button
                type="button"
                onClick={() => setAction('activate')}
                className="btn-primary text-sm"
              >
                Mark Payment Received & Activate
              </button>
            ) : (
              <div className="space-y-3 rounded-lg bg-grass/5 border border-grass/20 p-4">
                <p className="text-sm text-ink">
                  Confirm that <strong>{vendor.businessName}</strong> has completed the participation fee and activate their account?
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAction('activate')}
                    disabled={submitting}
                    className="btn-primary text-sm disabled:opacity-50"
                  >
                    {submitting ? 'Activating...' : 'Confirm Activation'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAction(null)}
                    className="text-sm font-medium text-ink/50 hover:text-ink"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
