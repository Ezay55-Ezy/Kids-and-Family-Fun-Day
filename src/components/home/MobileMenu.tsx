'use client';

import { useState } from 'react';
import Link from 'next/link';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Events', href: '/events' },
  { label: 'Vendors', href: '/vendors' },
  { label: 'Gallery', href: '/gallery' },
];

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-ink/70 hover:bg-ink/5 hover:text-ink transition-colors"
        aria-label={open ? 'Close menu' : 'Open menu'}
      >
        {open ? (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full z-50 border-b border-ink/10 bg-paper shadow-soft-lg">
          <nav className="mx-auto max-w-7xl px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-4 py-2.5 text-sm font-medium text-ink/70 hover:bg-ink/5 hover:text-ink transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-ink/10 mt-2 pt-2 space-y-1">
              <Link
                href="/auth/login"
                onClick={() => setOpen(false)}
                className="block rounded-lg px-4 py-2.5 text-sm font-medium text-ink/70 hover:bg-ink/5 hover:text-ink transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                onClick={() => setOpen(false)}
                className="block rounded-lg px-4 py-2.5 text-sm font-medium text-ink/70 hover:bg-ink/5 hover:text-ink transition-colors"
              >
                Register
              </Link>
              <Link
                href="/events"
                onClick={() => setOpen(false)}
                className="block rounded-lg bg-coral px-4 py-2.5 text-center text-sm font-semibold text-paper hover:bg-coral/90 transition-colors"
              >
                Book an Event
              </Link>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
