export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 rounded bg-ink/10" />
        <div className="h-10 w-32 rounded-lg bg-ink/10" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-ink/10 bg-paper p-6">
            <div className="h-4 w-24 rounded bg-ink/10" />
            <div className="h-8 w-16 rounded bg-ink/10 mt-2" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-ink/10 bg-paper p-6">
        <div className="h-6 w-40 rounded bg-ink/10 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 rounded bg-ink/5" />
          ))}
        </div>
      </div>
    </div>
  );
}
