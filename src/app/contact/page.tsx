import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with Kids & Family Fun Day Kenya.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-paper">
      <section className="bg-ink text-paper">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-coral uppercase tracking-wider">
              Get in Touch
            </p>
            <h1 className="font-display text-3xl md:text-5xl font-bold text-paper mt-3 leading-tight">
              Contact Us
            </h1>
            <p className="mt-5 text-lg text-paper/60 leading-relaxed max-w-2xl">
              Have a question, partnership inquiry, or need support? We&apos;d love to hear from you.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Contact Form */}
          <div>
            <h2 className="font-display text-xl font-bold text-ink">Send us a message</h2>
            <p className="text-sm text-ink/50 mt-1">Fill out the form and we&apos;ll get back to you within 24 hours.</p>

            <form className="mt-6 space-y-4" action="#" method="POST">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="label-base">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="input-base"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="label-base">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="input-base"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="subject" className="label-base">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  className="input-base"
                  placeholder="How can we help?"
                />
              </div>
              <div>
                <label htmlFor="message" className="label-base">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  className="input-base resize-none"
                  placeholder="Tell us more..."
                />
              </div>
              <button type="submit" className="btn-primary">
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="lg:pl-8">
            <h2 className="font-display text-xl font-bold text-ink">Contact Information</h2>
            <p className="text-sm text-ink/50 mt-1">Reach out through any of these channels.</p>

            <div className="mt-6 space-y-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-coral/10 text-coral shrink-0">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-ink">Location</p>
                  <p className="text-sm text-ink/50">Nairobi, Kenya</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-coral/10 text-coral shrink-0">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-ink">Email</p>
                  <p className="text-sm text-ink/50">info@kidsfamilyfunday.co.ke</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-coral/10 text-coral shrink-0">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-ink">Phone</p>
                  <p className="text-sm text-ink/50">+254 700 000 000</p>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-xl border border-ink/10 bg-ink/[0.02] p-6">
              <h3 className="font-display font-semibold text-ink">Business Hours</h3>
              <div className="mt-3 space-y-1.5 text-sm text-ink/50">
                <p>Monday – Friday: 8:00 AM – 6:00 PM</p>
                <p>Saturday: 9:00 AM – 1:00 PM</p>
                <p>Sunday & Public Holidays: Closed</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
