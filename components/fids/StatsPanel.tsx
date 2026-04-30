'use client';

import { useEffect, useState } from 'react';
import type { FlightStatus, Terminal, Airline } from '@/types';

interface StatsData {
  total: number;
  byStatus: Partial<Record<FlightStatus, number>>;
  byTerminal: Partial<Record<Terminal, number>>;
  byAirline: Partial<Record<Airline, number>>;
  delays: {
    count: number;
    averageMinutes: number;
  };
}

const STATUS_COLORS: Record<FlightStatus, string> = {
  'On Time': 'text-emerald-400',
  Boarding: 'text-amber-400',
  Departed: 'text-zinc-500',
  Delayed: 'text-orange-400',
  Cancelled: 'text-red-400',
};

export function StatsPanel() {
  const [stats, setStats] = useState<StatsData | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/flights/stats');
        const data = (await res.json()) as StatsData;
        setStats(data);
      } catch {
        // silently fail — stats are optional, board still works
      }
    }
    void load();
    const interval = setInterval(load, 10_000);
    return () => clearInterval(interval);
  }, []);

  if (!stats) return null;

  const statusEntries = Object.entries(stats.byStatus) as [FlightStatus, number][];
  const terminalEntries = Object.entries(stats.byTerminal) as [Terminal, number][];

  return (
    <div className="bg-board-header border-b border-board-border px-6 py-3 flex flex-wrap items-center gap-6 text-xs font-mono">
      {/* Status breakdown */}
      <div className="flex items-center gap-3">
        <span className="text-board-muted uppercase tracking-widest">Status:</span>
        {statusEntries.map(([status, count]) => (
          <span key={status} className={`${STATUS_COLORS[status]} font-bold`}>
            {count}
            <span className="text-board-muted font-normal ml-0.5">{status}</span>
          </span>
        ))}
      </div>

      {/* Terminal breakdown */}
      <div className="flex items-center gap-3">
        <span className="text-board-muted uppercase tracking-widest">Terminal:</span>
        {terminalEntries.map(([terminal, count]) => (
          <span key={terminal} className="text-amber-300 font-bold">
            {count}
            <span className="text-board-muted font-normal ml-0.5">{terminal}</span>
          </span>
        ))}
      </div>

      {/* Avg delay */}
      {stats.delays.count > 0 && (
        <div className="flex items-center gap-1 ml-auto">
          <span className="text-board-muted uppercase tracking-widest">Avg delay:</span>
          <span className="text-orange-400 font-bold">+{stats.delays.averageMinutes} min</span>
          <span className="text-board-muted">({stats.delays.count} delayed)</span>
        </div>
      )}
    </div>
  );
}
