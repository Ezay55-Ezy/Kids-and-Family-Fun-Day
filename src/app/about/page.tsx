import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const metadata = {
  title: 'About',
  description: 'Learn about Kids & Family Fun Day — Kenya\'s premier outdoor family festival platform.',
};

export default async function AboutPage() {
  let eventCount = 0;
  let vendorCount = 0;

  try {
    [eventCount, vendorCount] = await Promise.all([
      prisma.event.count({ where: { status: 'PUBLISHED' } }),
      prisma.vendor.count({ where: { status: 'ACTIVE' } }),
    ]);
  } catch {
    // fallback to 0
  }

  return (
    <div className="min-h-screen bg-paper">
      {/* Hero */}
      <section className="bg-ink text-paper">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-coral uppercase tracking-wider">
              About Us
            </p>
            <h1 className="font-display text-3xl md:text-5xl font-bold text-paper mt-3 leading-tight">
              Building Kenya&apos;s Family Events Ecosystem
            </h1>
            <p className="mt-5 text-lg text-paper/60 leading-relaxed max-w-2xl">
              We believe every family deserves access to safe, fun, and well-organized events.
              Kids & Family Fun Day was created to bridge the gap between event organizers and
              the communities they serve.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div>
            <p className="text-sm font-semibold text-coral uppercase tracking-wider">
              Our Mission
            </p>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-ink mt-2">
              Making Family Events Effortless
            </h2>
            <p className="mt-4 text-ink/60 leading-relaxed">
              We provide a complete platform that handles everything from event discovery
              to secure M-Pesa ticketing, vendor management, and real-time check-in —
              so organizers can focus on creating experiences, not managing logistics.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-ink/10 bg-white p-4">
                <span className="font-display text-2xl font-bold text-coral">{eventCount}+</span>
                <p className="text-sm text-ink/50 mt-1">Events Hosted</p>
              </div>
              <div className="rounded-xl border border-ink/10 bg-white p-4">
                <span className="font-display text-2xl font-bold text-coral">{vendorCount}+</span>
                <p className="text-sm text-ink/50 mt-1">Trusted Vendors</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-ink/10 bg-ink/[0.02] p-8 md:p-12">
            <div className="space-y-6">
              {[
                { icon: '🎯', title: 'Curated Events', desc: 'Every event is vetted for quality, safety, and family-friendliness.' },
                { icon: '💳', title: 'M-Pesa Payments', desc: 'Secure, instant payments through Kenya\'s most trusted mobile money platform.' },
                { icon: '📱', title: 'Digital Tickets', desc: 'QR-coded tickets delivered instantly — no printing, no queues.' },
                { icon: '🏪', title: 'Vendor Marketplace', desc: 'A growing network of vetted vendors serving families across Kenya.' },
              ].map((item) => (
                <div key={item.title} className="flex gap-4">
                  <span className="text-2xl shrink-0">{item.icon}</span>
                  <div>
                    <h3 className="font-display font-semibold text-ink">{item.title}</h3>
                    <p className="text-sm text-ink/50 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-ink/[0.02]">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-16 md:py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-sm font-semibold text-coral uppercase tracking-wider">
              Our Values
            </p>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-ink mt-2">
              What Drives Us
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: 'Community First', desc: 'We build for families, schools, and communities — not investors. Every feature serves a real need.' },
              { title: 'Trust & Safety', desc: 'Vetted vendors, secure payments, and transparent processes. Families should never worry about quality.' },
              { title: 'Simplicity', desc: 'Complex backend, simple frontend. We handle the hard parts so organizers and attendees don\'t have to.' },
              { title: 'Growth', desc: 'We help vendors and organizers grow their businesses through visibility, analytics, and tools.' },
              { title: 'Accessibility', desc: 'Mobile-first design, M-Pesa integration, and inclusive pricing ensure everyone can participate.' },
              { title: 'Local Focus', desc: 'Built in Kenya, for Kenya. We understand the local market and design for real-world needs.' },
            ].map((value) => (
              <div key={value.title} className="rounded-xl border border-ink/10 bg-white p-6">
                <h3 className="font-display font-semibold text-lg text-ink">{value.title}</h3>
                <p className="mt-2 text-sm text-ink/50 leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-16 md:py-20 text-center">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-ink">
          Ready to Get Started?
        </h2>
        <p className="mt-3 text-ink/50 text-lg max-w-xl mx-auto">
          Whether you&apos;re looking to attend events or grow your business, we&apos;re here to help.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 rounded-lg bg-coral px-6 py-3 text-sm font-semibold text-white hover:bg-coral/90 transition-colors"
          >
            Browse Events
          </Link>
          <Link
            href="/become-a-vendor"
            className="inline-flex items-center gap-2 rounded-lg border border-ink/20 px-6 py-3 text-sm font-medium text-ink hover:bg-ink/5 transition-colors"
          >
            Become a Vendor
          </Link>
        </div>
      </section>
    </div>
  );
}
