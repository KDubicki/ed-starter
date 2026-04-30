'use client';

import { useState } from 'react';
import { useFlightsStore } from '@/store/flightsStore';
import type { Flight } from '@/types';

interface DelayControlProps {
  flight: Flight;
}

export function DelayControl({ flight }: DelayControlProps) {
  const { updateFlight } = useFlightsStore();
  const [minutes, setMinutes] = useState(flight.delayMinutes?.toString() ?? '');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<'ok' | 'err' | null>(null);

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    const delayMinutes = parseInt(minutes) || 0;
    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/flights/delay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: flight.id, delayMinutes }),
      });

      if (res.ok) {
        const updated = (await res.json()) as Flight;
        updateFlight(flight.id, { status: updated.status, delayMinutes: updated.delayMinutes });
        setFeedback('ok');
        if (delayMinutes === 0) setMinutes('');
      } else {
        setFeedback('err');
      }
    } catch {
      setFeedback('err');
    } finally {
      setLoading(false);
      setTimeout(() => setFeedback(null), 2000);
    }
  }

  async function handleClear() {
    setMinutes('');
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/flights/delay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: flight.id, delayMinutes: 0 }),
      });
      if (res.ok) {
        const updated = (await res.json()) as Flight;
        updateFlight(flight.id, { status: updated.status, delayMinutes: undefined });
        setFeedback('ok');
      } else {
        setFeedback('err');
      }
    } catch {
      setFeedback('err');
    } finally {
      setLoading(false);
      setTimeout(() => setFeedback(null), 2000);
    }
  }

  const isDisabled = loading || flight.status === 'Cancelled' || flight.status === 'Departed';

  return (
    <form onSubmit={handleApply} className="flex items-center gap-2 mt-1">
      <span className="text-xs text-zinc-500 uppercase tracking-wider">Delay:</span>
      <input
        type="number"
        min={1}
        max={999}
        placeholder="min"
        value={minutes}
        onChange={(e) => setMinutes(e.target.value)}
        disabled={isDisabled}
        className="w-16 bg-zinc-900 border border-zinc-700 text-orange-300 text-xs px-2 py-1 rounded focus:outline-none focus:border-orange-600 disabled:opacity-30"
      />
      <button
        type="submit"
        disabled={isDisabled || !minutes}
        className="text-xs border border-orange-800 text-orange-400 hover:bg-orange-900/30 px-2 py-1 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        Set
      </button>
      {flight.delayMinutes && (
        <button
          type="button"
          onClick={handleClear}
          disabled={isDisabled}
          className="text-xs border border-zinc-700 text-zinc-400 hover:bg-zinc-800 px-2 py-1 rounded transition-colors disabled:opacity-30"
        >
          Clear
        </button>
      )}
      {feedback === 'ok' && <span className="text-emerald-400 text-xs">✓</span>}
      {feedback === 'err' && <span className="text-red-400 text-xs">✕ error</span>}
    </form>
  );
}
