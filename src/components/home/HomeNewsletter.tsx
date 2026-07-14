'use client';

import { useState } from 'react';

export default function HomeNewsletter() {
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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full max-w-md mx-auto">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        className="flex-1 rounded-xl border border-paper/20 bg-paper/10 px-4 py-3 text-sm text-paper placeholder:text-paper/40 focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20 backdrop-blur-sm transition-colors"
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="rounded-xl bg-coral px-6 py-3 text-sm font-semibold text-paper hover:bg-coral/90 disabled:opacity-50 transition-colors whitespace-nowrap"
      >
        {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
      </button>
      {status === 'success' && (
        <p className="absolute -bottom-7 left-0 text-sm text-grass">{message}</p>
      )}
      {status === 'error' && (
        <p className="absolute -bottom-7 left-0 text-sm text-coral">{message}</p>
      )}
    </form>
  );
}
