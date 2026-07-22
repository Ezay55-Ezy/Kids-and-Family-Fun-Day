'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/components/dashboard/ThemeProvider';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Events', href: '/events' },
  { label: 'Vendors', href: '/vendors' },
  { label: 'Sponsors', href: '/sponsors' },
  { label: 'Gallery', href: '/gallery' },
];

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  let theme: 'light' | 'dark' = 'light';
  let toggleTheme = () => {};
  try {
    const ctx = useTheme();
    theme = ctx.theme;
    toggleTheme = ctx.toggleTheme;
  } catch {
    // ThemeProvider not available during SSR prerender
  }

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
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
        <div className="absolute inset-x-0 top-full z-50 border-b border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
          <nav className="mx-auto max-w-7xl px-4 py-3 space-y-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-md px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-slate-100 mt-2 pt-2 space-y-0.5 dark:border-slate-700">
              <button
                onClick={toggleTheme}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                {theme === 'dark' ? (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="5" />
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                )}
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
              <Link
                href="/auth/login"
                onClick={() => setOpen(false)}
                className="block rounded-md px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                onClick={() => setOpen(false)}
                className="block rounded-md bg-teal-700 px-3 py-2.5 text-center text-sm font-semibold text-white hover:bg-teal-800 transition-colors"
              >
                Register
              </Link>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
