'use client';

interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
}

export default function DonutChart({ data, size = 160 }: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) {
    return (
      <div className="flex items-center justify-center text-ink/20" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>
    );
  }

  const cx = 18;
  const cy = 18;
  const r = 15.9;
  const circumference = 2 * Math.PI * r;

  let cumulative = 0;
  const segments = data.map((d) => {
    const offset = cumulative;
    const length = (d.value / total) * circumference;
    cumulative += length;
    return { ...d, offset, length };
  });

  return (
    <div className="flex flex-col items-center gap-3" style={{ width: size }}>
      <svg width={size} height={size} viewBox="0 0 36 36">
        {segments.map((seg) => (
          <circle
            key={seg.label}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth="3"
            strokeDasharray={`${seg.length} ${circumference - seg.length}`}
            strokeDashoffset={-(seg.offset + circumference / 4)}
          />
        ))}
        <circle cx={cx} cy={cy} r="12" fill="#fff" />
      </svg>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
            <span className="text-xs text-ink/60">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
