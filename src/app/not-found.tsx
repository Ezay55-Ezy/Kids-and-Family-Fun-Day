import Link from 'next/link';

export default function RootNotFound() {
  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-coral/10">
          <span className="font-display text-4xl font-bold text-coral">404</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-ink">Page not found</h1>
        <p className="mt-3 text-ink/60 leading-relaxed">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link href="/" className="btn-primary mt-8 inline-flex">
          Go Home
        </Link>
      </div>
    </div>
  );
}
