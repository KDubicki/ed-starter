'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="text-center space-y-6 p-8">
          <div className="text-6xl">✈️</div>
          <h1 className="text-2xl font-bold tracking-widest uppercase text-red-400">
            System Error
          </h1>
          <p className="text-sm text-zinc-400 max-w-md mx-auto">
            The flight information system encountered an unexpected error.
            {error.digest && (
              <span className="block mt-2 font-mono text-xs text-zinc-600">
                Ref: {error.digest}
              </span>
            )}
          </p>
          <button
            onClick={reset}
            className="text-xs text-amber-400 border border-amber-800 px-6 py-2 rounded hover:bg-amber-900/20 transition-colors"
          >
            Retry
          </button>
        </div>
      </body>
    </html>
  );
}
