'use client';

import { useEffect, useState, useCallback } from 'react';
import { formatCurrency } from '@/lib/format';

interface TicketTypeItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  capacity: number;
  ticketsSold: number;
  createdAt: string;
}

interface TicketTypeFormData {
  name: string;
  description: string;
  price: string;
  capacity: string;
}

const emptyForm: TicketTypeFormData = {
  name: '',
  description: '',
  price: '',
  capacity: '',
};

export default function TicketTypeList({ eventId }: { eventId: string }) {
  const [ticketTypes, setTicketTypes] = useState<TicketTypeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TicketTypeFormData>(emptyForm);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof TicketTypeFormData, string>>>({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const fetchTicketTypes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/events/${eventId}/ticket-types`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setTicketTypes(data.ticketTypes);
    } catch {
      setError('Failed to load ticket types.');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchTicketTypes();
  }, [fetchTicketTypes]);

  const validate = (): boolean => {
    const errors: typeof formErrors = {};
    if (!form.name.trim()) errors.name = 'Name is required';
    const price = parseFloat(form.price);
    if (isNaN(price) || price < 0) errors.price = 'Price must be 0 or greater';
    const capacity = parseInt(form.capacity, 10);
    if (isNaN(capacity) || capacity < 0) errors.capacity = 'Capacity must be 0 or greater';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setForm(emptyForm);
    setFormErrors({});
    setSubmitError('');
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setSubmitError('');

    const body = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      price: parseFloat(form.price),
      capacity: parseInt(form.capacity, 10),
    };

    try {
      let res: Response;
      if (editingId) {
        res = await fetch(`/api/admin/ticket-types/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch(`/api/admin/events/${eventId}/ticket-types`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }

      if (!res.ok) {
        const data = await res.json();
        if (res.status === 400 && data.details?.fieldErrors) {
          const serverErrors: typeof formErrors = {};
          for (const [field, msgs] of Object.entries(data.details.fieldErrors)) {
            if (msgs && (msgs as string[]).length > 0) {
              serverErrors[field as keyof TicketTypeFormData] = (msgs as string[])[0];
            }
          }
          setFormErrors(serverErrors);
          return;
        }
        throw new Error(data.error || 'Something went wrong');
      }

      resetForm();
      fetchTicketTypes();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (tt: TicketTypeItem) => {
    setForm({
      name: tt.name,
      description: tt.description || '',
      price: String(tt.price),
      capacity: String(tt.capacity),
    });
    setEditingId(tt.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/admin/ticket-types/${id}`, { method: 'DELETE' });
    if (res.ok) {
      fetchTicketTypes();
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-16 rounded-xl bg-ink/5 animate-pulse" />
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display font-semibold text-lg text-ink">Ticket Types</h3>
          <p className="text-sm text-ink/50">Define one or more ticket types for this event.</p>
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={() => { resetForm(); setShowForm(true); }}
            className="btn-primary text-sm"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add ticket type
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-xl bg-ink/5 border border-ink/10 p-4 space-y-4">
          {submitError && (
            <div className="rounded-lg bg-coral/10 border border-coral/20 p-3 text-sm text-coral">
              {submitError}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="tt-name" className="block text-sm font-medium text-ink mb-1">
                Name *
              </label>
              <input
                id="tt-name"
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field"
                placeholder="e.g. Early Bird, VIP, General Admission"
              />
              {formErrors.name && <p className="text-xs text-coral mt-1">{formErrors.name}</p>}
            </div>
            <div>
              <label htmlFor="tt-price" className="block text-sm font-medium text-ink mb-1">
                Price (KES) *
              </label>
              <input
                id="tt-price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="input-field"
                placeholder="0"
              />
              {formErrors.price && <p className="text-xs text-coral mt-1">{formErrors.price}</p>}
            </div>
            <div>
              <label htmlFor="tt-capacity" className="block text-sm font-medium text-ink mb-1">
                Capacity *
              </label>
              <input
                id="tt-capacity"
                type="number"
                min="0"
                step="1"
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                className="input-field"
                placeholder="0"
              />
              {formErrors.capacity && <p className="text-xs text-coral mt-1">{formErrors.capacity}</p>}
            </div>
            <div>
              <label htmlFor="tt-description" className="block text-sm font-medium text-ink mb-1">
                Description
              </label>
              <input
                id="tt-description"
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input-field"
                placeholder="Optional description"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 justify-end">
            <button
              type="button"
              onClick={resetForm}
              className="text-sm font-medium text-ink/50 hover:text-ink transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary text-sm"
            >
              {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      )}

      {ticketTypes.length === 0 && !showForm ? (
        <div className="rounded-xl bg-paper border border-ink/10 p-8 text-center">
          <svg className="h-10 w-10 mx-auto text-ink/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
            <path d="M9 9h.01" />
          </svg>
          <h4 className="mt-3 font-display font-semibold text-base text-ink">No ticket types yet</h4>
          <p className="mt-1 text-sm text-ink/50">Add at least one ticket type so attendees can register.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {ticketTypes.map((tt) => (
            <div
              key={tt.id}
              className="rounded-xl bg-paper border border-ink/10 shadow-soft p-4"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-display font-semibold text-sm text-ink">{tt.name}</h4>
                    {tt.capacity - tt.ticketsSold <= 0 ? (
                      <span className="inline-flex items-center rounded-full bg-coral/10 px-2 py-0.5 text-xs font-semibold text-coral ring-1 ring-coral/20">
                        Sold Out
                      </span>
                    ) : null}
                    <span className="text-xs text-ink/40">
                      {Math.max(0, tt.capacity - tt.ticketsSold)} / {tt.capacity} remaining
                    </span>
                  </div>
                  {tt.description && (
                    <p className="text-xs text-ink/50 mt-0.5">{tt.description}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="font-display font-semibold text-sm text-ink">{formatCurrency(tt.price)}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => startEdit(tt)}
                    className="text-xs font-medium text-ink/50 hover:text-ink transition-colors"
                  >
                    Edit
                  </button>
                  <DeleteButton ticketTypeId={tt.id} onDeleted={fetchTicketTypes} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DeleteButton({ ticketTypeId, onDeleted }: { ticketTypeId: string; onDeleted: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/ticket-types/${ticketTypeId}`, { method: 'DELETE' });
      if (res.ok) {
        onDeleted();
      }
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  };

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="text-xs font-medium text-paper bg-coral rounded px-2 py-1 hover:bg-coral/90 disabled:opacity-50"
        >
          {deleting ? '...' : 'Confirm'}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="text-xs font-medium text-ink/50 hover:text-ink"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="text-xs font-medium text-coral hover:text-coral/80"
    >
      Delete
    </button>
  );
}
