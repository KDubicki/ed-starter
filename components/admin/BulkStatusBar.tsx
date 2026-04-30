'use client';

import { useState } from 'react';
import { useFlightsStore } from '@/store/flightsStore';
import { StatusBadge } from '@/components/fids/StatusBadge';
import type { Flight, FlightStatus } from '@/types';
import { ALL_STATUSES } from '@/types';

interface BulkStatusBarProps {
  selectedIds: string[];
  onClear: () => void;
}

export function BulkStatusBar({ selectedIds, onClear }: BulkStatusBarProps) {
  const { flights, setFlights } = useFlightsStore();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (selectedIds.length === 0) return null;

  async function handleBulkStatus(status: FlightStatus) {
    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/flights/bulk-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, status }),
      });

      if (res.ok) {
        const data = (await res.json()) as { updated: Flight[] };
        const updatedMap = new Map(data.updated.map((f) => [f.id, f]));
        const merged = flights.map((f) => updatedMap.get(f.id) ?? f);
        setFlights(merged);
        setFeedback(`✓ ${selectedIds.length} flights → ${status}`);
        onClear();
      } else {
        setFeedback('✕ Failed');
      }
    } catch {
      setFeedback('✕ Network error');
    } finally {
      setLoading(false);
      setTimeout(() => setFeedback(null), 3000);
    }
  }

  return (
    <div className="sticky top-0 z-10 bg-amber-950/90 border-b border-amber-800 backdrop-blur-sm px-6 py-3 flex flex-wrap items-center gap-3">
      <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">
        {selectedIds.length} selected
      </span>
      <span className="text-zinc-600 text-xs">Set status →</span>

      {ALL_STATUSES.map((s) => (
        <button
          key={s}
          onClick={() => handleBulkStatus(s)}
          disabled={loading}
          className="opacity-70 hover:opacity-100 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
        >
          <StatusBadge status={s} />
        </button>
      ))}

      <button
        onClick={onClear}
        className="ml-auto text-xs text-zinc-500 hover:text-zinc-300 border border-zinc-700 px-3 py-1 rounded transition-colors"
      >
        Deselect all
      </button>

      {feedback && (
        <span
          className={`text-xs font-mono ${feedback.startsWith('✓') ? 'text-emerald-400' : 'text-red-400'}`}
        >
          {feedback}
        </span>
      )}
    </div>
  );
}
