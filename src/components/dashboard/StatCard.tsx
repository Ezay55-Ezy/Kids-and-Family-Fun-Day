'use client';

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: 'coral' | 'sky' | 'grass' | 'sun';
}

const colorMap = {
  coral: {
    bg: 'bg-coral/10',
    text: 'text-coral',
    ring: 'ring-coral/20',
  },
  sky: {
    bg: 'bg-sky/10',
    text: 'text-sky',
    ring: 'ring-sky/20',
  },
  grass: {
    bg: 'bg-grass/10',
    text: 'text-grass',
    ring: 'ring-grass/20',
  },
  sun: {
    bg: 'bg-sun/10',
    text: 'text-sun',
    ring: 'ring-sun/20',
  },
};

export default function StatCard({ label, value, icon, color }: StatCardProps) {
  const palette = colorMap[color];

  return (
    <div className="rounded-xl bg-paper border border-ink/10 p-6 shadow-soft transition-shadow hover:shadow-soft-lg">
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${palette.bg} ${palette.text} ring-1 ${palette.ring}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-ink/60">{label}</p>
          <p className="font-display text-2xl font-bold text-ink mt-0.5">{value}</p>
        </div>
      </div>
    </div>
  );
}
