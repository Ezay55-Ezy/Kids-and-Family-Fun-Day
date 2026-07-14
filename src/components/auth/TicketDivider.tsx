'use client';

export default function TicketDivider({ className = '' }: { className?: string }) {
  return (
    <div
      className={`relative w-px hidden lg:block ${className}`}
      aria-hidden="true"
      role="separator"
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {[...Array(24)].map((_, i) => (
          <div
            key={i}
            className="w-px h-3 bg-ink/10"
            style={{ animationDelay: `${i * 50}ms` }}
          />
        ))}
      </div>
      <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 pointer-events-none">
        <div className="w-2 h-2 rounded-full bg-ink/20" />
        <div className="w-2 h-2 rounded-full bg-ink/20" />
        <div className="w-2 h-2 rounded-full bg-ink/20" />
      </div>
    </div>
  );
}