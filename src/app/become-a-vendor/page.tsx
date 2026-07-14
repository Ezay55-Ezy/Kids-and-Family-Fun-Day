import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/auth';
import { getVendorProfile } from '@/services/vendor-service';
import VendorRegistrationForm from '@/components/vendor/VendorRegistrationForm';

export const metadata = {
  title: 'Become a Vendor',
  description: 'Register your business as a vendor for Kids & Family Fun Day Kenya events',
};

export default async function BecomeVendorPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/login?callbackUrl=/become-a-vendor');
  }

  const existingVendor = await getVendorProfile(session.user.id);
  if (existingVendor) {
    const role = session.user.role;
    if (role === 'ADMIN') {
      redirect('/admin');
    }
    redirect('/vendor');
  }

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
          <Link href="/dashboard" className="btn-secondary text-sm px-4 py-2">
            Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8 py-12 md:py-16">
        <div className="text-center mb-10">
          <h1 className="font-display font-bold text-3xl md:text-4xl text-ink mb-4 tracking-tight">
            Become a Vendor
          </h1>
          <p className="font-body text-lg text-ink/60 leading-relaxed max-w-2xl mx-auto">
            Offer your services at our events and reach thousands of families across Kenya.
            Register your business below and our team will review your application.
          </p>
        </div>

        <div className="mx-auto max-w-md">
          <VendorRegistrationForm />
        </div>
      </main>
    </div>
  );
}
