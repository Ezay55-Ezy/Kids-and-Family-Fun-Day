export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-ink/10 border-t-coral" />
        <p className="text-sm text-ink/50 font-body">Loading...</p>
      </div>
    </div>
  );
}
