export default function Loading() {
  return (
    <div className="min-h-screen bg-board-bg flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="inline-block h-8 w-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-board-muted uppercase tracking-widest">Loading flight data…</p>
      </div>
    </div>
  );
}
