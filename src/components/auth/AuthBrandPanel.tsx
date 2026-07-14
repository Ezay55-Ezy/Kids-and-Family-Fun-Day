'use client';

export default function AuthBrandPanel() {
  return (
    <div className="relative flex flex-col justify-between p-8 md:p-12 lg:p-16 bg-ink text-paper min-h-screen hidden lg:flex">
      <div>
        <div className="mb-8 md:mb-12">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky/20 text-sky text-sm font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky" />
            </span>
            Registration Open
          </span>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6">
            Kids & Family Fun Day Kenya
          </h1>
          <p className="text-paper/80 text-lg md:text-xl max-w-md leading-relaxed">
            Kenya&apos;s premier outdoor family festival. Join thousands of families for a day of
            adventure, entertainment, and unforgettable memories.
          </p>
        </div>

        <ul className="space-y-4 mb-12" role="list" aria-label="Festival features">
          {[
            'Buy tickets online',
            'Discover family events',
            'Secure M-Pesa payments',
            'Fast registration',
          ].map((feature, index) => (
            <li key={index} className="flex items-center gap-3 text-paper/90">
              <svg
                className="h-5 w-5 flex-shrink-0 text-grass"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                aria-hidden="true"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-ink/30 pt-8">
        <div className="grid grid-cols-2 gap-6 md:gap-8">
          {[
            { label: 'EVENT', value: 'Kids & Family Fun Day' },
            { label: 'LOCATION', value: 'Kenya' },
            { label: 'ENTRY', value: 'Digital Ticket' },
            { label: 'STATUS', value: 'Registration Open' },
          ].map((item, index) => (
            <div key={index} className="space-y-1">
              <span className="font-mono text-xs tracking-widest text-paper/40 uppercase">
                {item.label}
              </span>
              <span className="font-display text-lg md:text-xl font-medium text-paper">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}