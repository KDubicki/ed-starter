import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-board-bg flex items-center justify-center">
      <div className="text-center space-y-6 p-8">
        <div className="text-6xl">🛫</div>
        <h1 className="text-4xl font-bold tracking-widest text-amber-400">404</h1>
        <p className="text-sm text-board-muted max-w-md mx-auto">
          This gate does not exist. The page you&apos;re looking for has departed.
        </p>
        <Link
          href="/"
          className="inline-block text-xs text-amber-400 border border-amber-800 px-6 py-2 rounded hover:bg-amber-900/20 transition-colors"
        >
          ← Return to Flight Board
        </Link>
      </div>
    </div>
  );
}
