import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register',
  description: 'Create your account to access Kids & Family Fun Day Kenya',
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-ink/10 bg-paper/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 font-display font-bold text-xl text-ink"
            aria-label="Kids & Family Fun Day Kenya - Home"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-coral text-paper font-body text-sm font-semibold">
              KF
            </span>
            <span className="hidden sm:block">Kids & Family Fun Day Kenya</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-ink/70 hover:text-ink transition-colors"
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-ink/10 bg-paper py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 text-center text-sm text-ink/50">
          <p>© {new Date().getFullYear()} Kids & Family Fun Day Kenya. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}