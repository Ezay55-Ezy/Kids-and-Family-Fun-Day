'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function BroadcastPage() {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number; totalRecipients: number; errors: string[] } | null>(null);
  const [error, setError] = useState('');

  async function handleSend() {
    setError('');
    setResult(null);

    if (!subject.trim()) return setError('Subject is required');
    if (!body.trim()) return setError('Body is required');

    setSending(true);
    try {
      const res = await fetch('/api/admin/newsletter/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: subject.trim(), body: body.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send');
      setResult(data);
      setSubject('');
      setBody('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send broadcast');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Send Newsletter</h1>
          <p className="mt-1 font-body text-ink/60">Compose and send a newsletter to all active subscribers</p>
        </div>
        <Link
          href="/admin/newsletter"
          className="inline-flex items-center gap-1.5 rounded-xl border border-ink/10 bg-paper px-4 py-2.5 text-sm font-medium text-ink hover:bg-ink/5 transition-colors"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Subscribers
        </Link>
      </div>

      {result && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-4">
          <p className="font-medium text-green-800">
            Newsletter sent successfully!
          </p>
          <p className="mt-1 text-sm text-green-700">
            {result.sent} of {result.totalRecipients} emails delivered
            {result.failed > 0 && ` (${result.failed} failed)`}
          </p>
          {result.errors.length > 0 && (
            <ul className="mt-2 list-disc pl-5 text-sm text-red-600">
              {result.errors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">{error}</div>
      )}

      <div className="rounded-xl border border-ink/10 bg-paper p-6 shadow-soft space-y-5">
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-ink mb-1.5">
            Subject
          </label>
          <input
            id="subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Upcoming Family Fun Day — June 2026"
            maxLength={200}
            className="w-full rounded-xl border border-ink/10 bg-white px-4 py-2.5 text-ink placeholder:text-ink/40 focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
          />
          <p className="mt-1 text-xs text-ink/40">{subject.length}/200</p>
        </div>

        <div>
          <label htmlFor="body" className="block text-sm font-medium text-ink mb-1.5">
            Message
          </label>
          <textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={12}
            placeholder="Write your newsletter content here. Each paragraph will be separated automatically."
            maxLength={10000}
            className="w-full rounded-xl border border-ink/10 bg-white px-4 py-3 text-ink placeholder:text-ink/40 focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700 resize-y"
          />
          <p className="mt-1 text-xs text-ink/40">{body.length}/10,000</p>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-ink/5 p-4">
          <div>
            <p className="text-sm font-medium text-ink">Ready to send?</p>
            <p className="text-xs text-ink/50">This will email all active newsletter subscribers</p>
          </div>
          <button
            onClick={handleSend}
            disabled={sending || !subject.trim() || !body.trim()}
            className="rounded-xl bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            {sending ? (
              <span className="inline-flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" />
                </svg>
                Sending...
              </span>
            ) : (
              'Send Newsletter'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
