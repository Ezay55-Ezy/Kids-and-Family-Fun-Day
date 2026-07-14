'use client';

import { useState, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { PasswordInput } from '@/components/auth/PasswordInput';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="rounded-xl border border-ink/10 bg-paper p-8 shadow-soft text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-coral/10">
          <svg className="h-7 w-7 text-coral" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <h2 className="font-display text-lg font-semibold text-ink">Invalid reset link</h2>
        <p className="text-ink/60 mt-2 text-sm">
          This password reset link is invalid or missing a token.
        </p>
        <Link href="/auth/forgot-password" className="btn-primary mt-6 inline-flex items-center gap-2 text-sm">
          Request a new link
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: newPassword, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push('/auth/login'), 3000);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-xl border border-ink/10 bg-paper p-8 shadow-soft text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-grass/10">
          <svg className="h-7 w-7 text-grass" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h2 className="font-display text-lg font-semibold text-ink">Password reset successfully</h2>
        <p className="text-ink/60 mt-2 text-sm">
          Redirecting you to sign in...
        </p>
        <Link href="/auth/login" className="btn-primary mt-6 inline-flex items-center gap-2 text-sm">
          Sign In Now
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-ink/10 bg-paper p-8 shadow-soft">
      {error && (
        <div className="mb-4 rounded-lg bg-coral/10 border border-coral/20 p-3 text-sm text-coral">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <PasswordInput
          label="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
          required
          helperText="At least 8 characters with an uppercase letter and a number"
        />

        <PasswordInput
          label="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          required
        />

        <button
          type="submit"
          disabled={loading || !newPassword || !confirmPassword}
          className="btn-primary w-full"
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
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
          <h1 className="font-display text-2xl font-bold text-ink">Set new password</h1>
          <p className="text-ink/60 mt-2 text-sm">
            Choose a strong password for your account.
          </p>
        </div>
        <Suspense fallback={
          <div className="rounded-xl border border-ink/10 bg-paper p-8 shadow-soft animate-pulse">
            <div className="space-y-5">
              <div className="h-20 rounded-lg bg-ink/5" />
              <div className="h-20 rounded-lg bg-ink/5" />
              <div className="h-10 rounded-lg bg-ink/5" />
            </div>
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
        <p className="mt-6 text-center text-sm text-ink/60">
          <Link href="/auth/login" className="link-text">
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
