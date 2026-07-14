export default function ServiceDetailLoading() {
  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-ink/10 bg-paper/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4 md:px-6 lg:px-8" />
      </header>

      <main>
        <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8 py-12">
          <div className="h-4 w-32 rounded bg-ink/5 animate-pulse mb-6" />

          <div className="rounded-xl bg-paper border border-ink/10 shadow-soft-lg overflow-hidden">
            <div className="aspect-[21/9] bg-ink/5 animate-pulse" />
            <div className="p-6 md:p-10 space-y-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="h-5 w-20 rounded-full bg-ink/5 animate-pulse" />
                  <div className="h-8 w-72 rounded bg-ink/5 animate-pulse" />
                </div>
                <div className="h-8 w-32 rounded bg-ink/5 animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-full rounded bg-ink/5 animate-pulse" />
                <div className="h-4 w-full rounded bg-ink/5 animate-pulse" />
                <div className="h-4 w-3/4 rounded bg-ink/5 animate-pulse" />
              </div>
              <div className="h-32 rounded-xl bg-ink/5 animate-pulse" />
              <div className="h-20 rounded-xl bg-ink/5 animate-pulse" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
