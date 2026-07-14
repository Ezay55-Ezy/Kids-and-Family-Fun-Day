export default function EventDetailLoading() {
  return (
    <div className="min-h-screen bg-paper animate-pulse">
      <header className="border-b border-ink/10 bg-paper h-16" />

      <div className="h-[200px] md:h-[300px] bg-ink/5" />

      <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8 -mt-16 md:-mt-24 relative z-10">
        <div className="rounded-xl bg-paper border border-ink/10 shadow-soft-lg p-6 md:p-10">
          <div className="h-5 w-24 rounded-full bg-ink/10 mb-4" />
          <div className="h-9 w-3/4 rounded bg-ink/10" />
          <div className="h-5 w-full rounded bg-ink/10 mt-4" />

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-ink/5 p-4">
              <div className="h-3 w-20 rounded bg-ink/10" />
              <div className="h-4 w-40 rounded bg-ink/10 mt-2" />
            </div>
            <div className="rounded-lg bg-ink/5 p-4">
              <div className="h-3 w-20 rounded bg-ink/10" />
              <div className="h-4 w-32 rounded bg-ink/10 mt-2" />
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <div className="h-4 w-full rounded bg-ink/10" />
            <div className="h-4 w-full rounded bg-ink/10" />
            <div className="h-4 w-3/4 rounded bg-ink/10" />
          </div>

          <div className="mt-8 rounded-xl bg-ink/5 p-6">
            <div className="h-6 w-48 rounded bg-ink/10 mx-auto" />
            <div className="h-12 w-40 rounded-lg bg-ink/10 mx-auto mt-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
