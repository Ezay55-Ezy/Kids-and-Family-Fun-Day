import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms and conditions for using the Kids & Family Fun Day Kenya platform.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-paper">
      <section className="bg-ink text-paper">
        <div className="mx-auto max-w-3xl px-4 md:px-6 lg:px-8 py-20 md:py-28">
          <h1 className="font-display text-3xl md:text-5xl font-bold text-paper leading-tight">
            Terms of Service
          </h1>
          <p className="mt-3 text-sm text-paper/50">
            Last updated: {new Date().toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 md:px-6 lg:px-8 py-16">
        <div className="prose prose-slate max-w-none space-y-10 text-ink/70 leading-relaxed">
          <div>
            <h2 className="font-display text-xl font-bold text-ink mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Kids &amp; Family Fun Day, you agree to these Terms of Service.
              If you do not agree, please do not use our platform.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-bold text-ink mb-3">2. Account Responsibilities</h2>
            <p>
              You are responsible for maintaining the security of your account and for all activities
              that occur under it. You must provide accurate information when creating your account
              and keep it up to date.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-bold text-ink mb-3">3. Event Tickets &amp; Payments</h2>
            <p>
              All ticket purchases are processed via M-Pesa or other supported payment methods.
              Tickets are non-refundable unless the event is cancelled by the organizer. By
              purchasing a ticket, you agree to the event&apos;s specific terms and conditions.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-bold text-ink mb-3">4. Vendor Obligations</h2>
            <p>
              Vendors are responsible for the accuracy of their listings, fulfilling bookings,
              and maintaining appropriate business licenses. Kids &amp; Family Fun Day acts as a
              marketplace platform and is not a party to vendor-customer transactions.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-bold text-ink mb-3">5. Limitation of Liability</h2>
            <p>
              Kids &amp; Family Fun Day is not liable for any indirect, incidental, or consequential
              damages arising from your use of the platform. Our total liability shall not exceed
              the amount you paid for the specific transaction in question.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-bold text-ink mb-3">6. Contact</h2>
            <p>
              For questions about these terms, contact us at{' '}
              <a href="mailto:info@kidsfamilyfunday.co.ke" className="text-coral hover:underline">
                info@kidsfamilyfunday.co.ke
              </a>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
