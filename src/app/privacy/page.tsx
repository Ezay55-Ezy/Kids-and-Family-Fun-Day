import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Kids & Family Fun Day Kenya collects, uses, and protects your personal information.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-paper">
      <section className="bg-ink text-paper">
        <div className="mx-auto max-w-3xl px-4 md:px-6 lg:px-8 py-20 md:py-28">
          <h1 className="font-display text-3xl md:text-5xl font-bold text-paper leading-tight">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-paper/50">
            Last updated: {new Date().toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 md:px-6 lg:px-8 py-16">
        <div className="prose prose-slate max-w-none space-y-10 text-ink/70 leading-relaxed">
          <div>
            <h2 className="font-display text-xl font-bold text-ink mb-3">1. Information We Collect</h2>
            <p>
              When you use Kids &amp; Family Fun Day, we collect information you provide directly, such as
              your name, email address, phone number, and payment information (processed securely via M-Pesa
              and our payment partners). We also collect usage data including pages visited, actions taken,
              and device information.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-bold text-ink mb-3">2. How We Use Your Information</h2>
            <p>
              We use your information to process transactions, send ticket confirmations, communicate about
              events, improve our platform, and provide customer support. We do not sell your personal data
              to third parties.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-bold text-ink mb-3">3. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your personal information. Payment
              data is encrypted and processed through secure payment providers. However, no method of
              transmission over the internet is 100% secure.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-bold text-ink mb-3">4. Your Rights</h2>
            <p>
              You have the right to access, correct, or delete your personal data. You can manage your
              account information through your dashboard settings, or contact us directly at{' '}
              <a href="mailto:info@kidsfamilyfunday.co.ke" className="text-coral hover:underline">
                info@kidsfamilyfunday.co.ke
              </a>.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-bold text-ink mb-3">5. Contact</h2>
            <p>
              For questions about this privacy policy, contact us at{' '}
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
