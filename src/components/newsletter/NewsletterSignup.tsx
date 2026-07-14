'use client';

import { useState } from 'react';

interface NewsletterSignupProps {
  variant?: 'inline' | 'card';
}

export default function NewsletterSignup({ variant = 'card' }: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setStatus('success');
      setMessage(data.message || 'Successfully subscribed!');
      setEmail('');
    } catch (err) {
      setStatus('error');
      setMessage((err as Error).message || 'Something went wrong');
    }
  }

  if (variant === 'inline') {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          className="flex-1 rounded-lg border border-ink/10 bg-white px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:border-sky focus:outline-none focus:ring-1 focus:ring-sky"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-ink/90 disabled:opacity-50"
        >
          {status === 'loading' ? '...' : 'Subscribe'}
        </button>
        {status === 'success' && <p className="text-sm text-grass">{message}</p>}
        {status === 'error' && <p className="text-sm text-coral">{message}</p>}
      </form>
    );
  }

  return (
    <div className="rounded-xl border border-ink/10 bg-white p-6 shadow-soft">
      <h3 className="font-display text-lg font-bold text-ink">Stay Updated</h3>
      <p className="mt-1 text-sm text-ink/60">
        Get the latest news about upcoming events, activities, and special offers.
      </p>
      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="rounded-lg border border-ink/10 bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:border-sky focus:outline-none focus:ring-1 focus:ring-sky"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-ink/90 disabled:opacity-50"
        >
          {status === 'loading' ? 'Subscribing...' : 'Subscribe to Newsletter'}
        </button>
      </form>
      {status === 'success' && (
        <p className="mt-2 text-sm text-grass">{message}</p>
      )}
      {status === 'error' && (
        <p className="mt-2 text-sm text-coral">{message}</p>
      )}
    </div>
  );
}
