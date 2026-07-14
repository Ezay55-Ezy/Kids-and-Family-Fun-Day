'use client';

interface BarChartProps {
  data: { label: string; value: number; color: string }[];
  height?: number;
}

export default function BarChart({ data, height = 200 }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {data.map((item) => {
        const pct = (item.value / max) * 100;
        return (
          <div key={item.label} className="flex flex-1 flex-col items-center gap-1.5 h-full justify-end">
            <span className="text-[11px] font-medium text-ink/60">{item.value}</span>
            <div
              className="w-full rounded-t transition-all"
              style={{ height: `${pct}%`, backgroundColor: item.color, minHeight: item.value > 0 ? 4 : 0 }}
            />
            <span className="text-[10px] text-ink/40 truncate w-full text-center leading-tight">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
