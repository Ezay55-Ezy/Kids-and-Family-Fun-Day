export default function ServiceSkeleton() {
  return (
    <div className="flex flex-col rounded-xl bg-paper border border-ink/10 overflow-hidden animate-pulse">
      <div className="aspect-[16/9] bg-ink/10" />
      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-center justify-between">
          <div className="h-4 w-32 rounded bg-ink/10" />
          <div className="h-4 w-16 rounded bg-ink/10" />
        </div>
        <div className="h-3 w-24 rounded bg-ink/10" />
        <div className="space-y-1.5 mt-1">
          <div className="h-3 w-full rounded bg-ink/10" />
          <div className="h-3 w-3/4 rounded bg-ink/10" />
        </div>
        <div className="h-3 w-28 rounded bg-ink/10" />
        <div className="h-10 w-full rounded-lg bg-ink/10 mt-2" />
      </div>
    </div>
  );
}
