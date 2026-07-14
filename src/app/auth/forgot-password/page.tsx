'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }

      setSent(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-coral text-paper font-bold text-sm">
              KF
            </div>
            <span className="font-display font-bold text-lg text-ink">Fun Day Kenya</span>
          </Link>
          <h1 className="font-display text-2xl font-bold text-ink">Forgot your password?</h1>
          <p className="text-ink/60 mt-2 text-sm">
            Enter your email and we&apos;ll send you a link to reset it.
          </p>
        </div>

        {sent ? (
          <div className="rounded-xl border border-ink/10 bg-paper p-8 shadow-soft text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-grass/10">
              <svg className="h-7 w-7 text-grass" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h2 className="font-display text-lg font-semibold text-ink">Check your email</h2>
            <p className="text-ink/60 mt-2 text-sm">
              If an account with <strong>{email}</strong> exists, we&apos;ve sent a password reset link.
            </p>
            <p className="text-ink/40 mt-4 text-xs">
              Didn&apos;t receive it? Check your spam folder, or{' '}
              <button
                type="button"
                onClick={() => { setSent(false); setEmail(''); }}
                className="text-coral font-medium hover:underline"
              >
                try a different email
              </button>.
            </p>
            <Link href="/auth/login" className="btn-primary mt-6 inline-flex items-center gap-2 text-sm">
              Back to Sign In
            </Link>
          </div>
        ) : (
          <div className="rounded-xl border border-ink/10 bg-paper p-8 shadow-soft">
            {error && (
              <div className="mb-4 rounded-lg bg-coral/10 border border-coral/20 p-3 text-sm text-coral">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="label-base">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-base"
                  placeholder="you@example.com"
                  required
                  autoFocus
                  autoComplete="email"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="btn-primary w-full"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-ink/60">
              Remember your password?{' '}
              <Link href="/auth/login" className="link-text">
                Sign in
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
