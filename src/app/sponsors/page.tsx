import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const metadata = {
  title: 'Sponsors',
  description: 'Meet the sponsors supporting Kenya\'s premier family festival platform.',
};

const TIER_CONFIG = {
  PLATINUM: {
    label: 'Platinum',
    card: 'border-purple-200 bg-gradient-to-br from-purple-50/50 to-white',
    badge: 'bg-purple-100 text-purple-700 border-purple-200',
    icon: 'bg-purple-100 text-purple-600',
    size: 'p-8',
  },
  GOLD: {
    label: 'Gold',
    card: 'border-amber-200 bg-gradient-to-br from-amber-50/50 to-white',
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: 'bg-amber-100 text-amber-600',
    size: 'p-7',
  },
  SILVER: {
    label: 'Silver',
    card: 'border-slate-200 bg-white',
    badge: 'bg-slate-100 text-slate-600 border-slate-200',
    icon: 'bg-slate-100 text-slate-500',
    size: 'p-6',
  },
  BRONZE: {
    label: 'Bronze',
    card: 'border-orange-200 bg-white',
    badge: 'bg-orange-50 text-orange-600 border-orange-200',
    icon: 'bg-orange-50 text-orange-500',
    size: 'p-6',
  },
} as const;

export default async function SponsorsPage() {
  const sponsors = await prisma.sponsor.findMany({
    where: { isPublished: true },
    select: {
      id: true,
      companyName: true,
      slug: true,
      description: true,
      logoUrl: true,
      websiteUrl: true,
      tier: true,
      displayOrder: true,
      _count: { select: { events: true } },
    },
    orderBy: [{ displayOrder: 'asc' }, { companyName: 'asc' }],
  });

  const grouped = {
    PLATINUM: sponsors.filter((s) => s.tier === 'PLATINUM'),
    GOLD: sponsors.filter((s) => s.tier === 'GOLD'),
    SILVER: sponsors.filter((s) => s.tier === 'SILVER'),
    BRONZE: sponsors.filter((s) => s.tier === 'BRONZE'),
  };

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-16 md:py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-sm font-semibold text-coral uppercase tracking-wider">
            Our Partners
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-ink mt-2">
            Proud Sponsors
          </h1>
          <p className="mt-4 text-ink/50 text-lg leading-relaxed">
            Meet the organizations supporting Kenya&apos;s premier family events platform.
          </p>
        </div>

        {sponsors.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-ink/40 text-lg">No sponsors yet. Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-12">
            {(['PLATINUM', 'GOLD', 'SILVER', 'BRONZE'] as const).map((tier) => {
              const tierSponsors = grouped[tier];
              if (tierSponsors.length === 0) return null;
              const config = TIER_CONFIG[tier];

              return (
                <div key={tier}>
                  <div className="flex items-center gap-3 mb-6">
                    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${config.badge}`}>
                      {config.label}
                    </span>
                    <div className="flex-1 h-px bg-ink/5" />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {tierSponsors.map((sponsor) => {
                      const card = (
                        <div className={`group rounded-2xl border ${config.card} ${config.size} shadow-soft hover:shadow-soft-lg transition-all duration-300`}>
                          <div className="flex items-center gap-4 mb-4">
                            <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${config.icon} font-display font-bold text-xl shrink-0`}>
                              {sponsor.logoUrl ? (
                                <img src={sponsor.logoUrl} alt={sponsor.companyName} className="h-10 w-10 object-contain rounded mix-blend-multiply" />
                              ) : (
                                sponsor.companyName.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-display font-semibold text-lg text-ink group-hover:text-coral transition-colors truncate">
                                {sponsor.companyName}
                              </h3>
                              <p className="text-xs text-ink/40">
                                {sponsor._count.events} linked event{sponsor._count.events !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                          {sponsor.description && (
                            <p className="text-sm text-ink/50 leading-relaxed line-clamp-3">
                              {sponsor.description}
                            </p>
                          )}
                          {sponsor.websiteUrl && (
                            <div className="mt-4">
                              <a
                                href={sponsor.websiteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-sm font-medium text-coral hover:underline"
                              >
                                Visit website
                                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                                </svg>
                              </a>
                            </div>
                          )}
                        </div>
                      );

                      return sponsor.websiteUrl ? (
                        <a
                          key={sponsor.id}
                          href={sponsor.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          {card}
                        </a>
                      ) : (
                        <div key={sponsor.id}>{card}</div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-16 text-center">
          <Link
            href="/become-a-vendor"
            className="inline-flex items-center gap-2 rounded-lg bg-coral px-6 py-3 text-sm font-semibold text-white hover:bg-coral/90 transition-colors"
          >
            Become a Sponsor
          </Link>
        </div>
      </div>
    </div>
  );
}
