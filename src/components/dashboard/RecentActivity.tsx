'use client';

interface ActivityItem {
  id: string;
  type: 'created' | 'completed' | 'login' | 'booked' | 'payment';
  title: string;
  description: string;
  timestamp: string;
}

const activityIcons: Record<ActivityItem['type'], React.ReactNode> = {
  created: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  completed: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  ),
  login: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13 12H3" />
    </svg>
  ),
  booked: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  payment: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="1" y="4" width="22" height="16" rx="2" />
      <path d="M1 10h22" />
    </svg>
  ),
};

interface RecentActivityProps {
  items?: ActivityItem[];
}

const typeColors: Record<ActivityItem['type'], string> = {
  created: 'bg-sky/10 text-sky ring-sky/20',
  completed: 'bg-grass/10 text-grass ring-grass/20',
  login: 'bg-coral/10 text-coral ring-coral/20',
  booked: 'bg-sun/10 text-sun ring-sun/20',
  payment: 'bg-ink/10 text-ink ring-ink/20',
};

export default function RecentActivity({ items }: RecentActivityProps) {
  const activities = items && items.length > 0 ? items : [];

  return (
    <div className="rounded-xl bg-paper border border-ink/10 shadow-soft">
      <div className="px-6 py-4 border-b border-ink/10">
        <h2 className="font-display font-semibold text-lg text-ink">Recent Activity</h2>
      </div>
      {activities.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <svg className="h-10 w-10 mx-auto text-ink/15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
          </svg>
          <p className="mt-3 text-sm text-ink/40">No activity yet</p>
          <p className="text-xs text-ink/30 mt-1">Your recent actions will appear here</p>
        </div>
      ) : (
        <div className="divide-y divide-ink/5">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-4 px-6 py-4">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-1 ${typeColors[activity.type]}`}>
                {activityIcons[activity.type]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink">{activity.title}</p>
                <p className="text-sm text-ink/60 mt-0.5">{activity.description}</p>
              </div>
              <time className="shrink-0 text-xs text-ink/40 mt-1">{activity.timestamp}</time>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
