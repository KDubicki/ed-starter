'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useFlightsStore } from '@/store/flightsStore';
import { StatusControl } from '@/components/admin/StatusControl';
import { DelayControl } from '@/components/admin/DelayControl';
import { BulkStatusBar } from '@/components/admin/BulkStatusBar';
import { FlightEditor } from '@/components/admin/FlightEditor';
import type { Flight } from '@/types';

export default function AdminPage() {
  const { flights, setFlights, removeFlight, resetFlights } = useFlightsStore();
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/flights')
      .then((r) => r.json())
      .then((data: Flight[]) => {
        setFlights(data);
        setLoading(false);
      });
  }, [setFlights]);

  async function handleRemove(id: string) {
    await fetch('/api/flights', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    removeFlight(id);
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function handleReset() {
    if (!confirm('Reset all flights to seed data?')) return;
    const res = await fetch('/api/flights/reset', { method: 'POST' });
    const data: Flight[] = await res.json();
    resetFlights(data);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-board-bg flex items-center justify-center text-board-muted font-mono text-sm">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-board-bg font-mono">
      {/* Header */}
      <header className="bg-board-header border-b border-board-border px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-widest text-amber-400 uppercase">
            Admin Panel
          </h1>
          <p className="text-xs text-board-muted mt-0.5">
            <Link href="/" className="hover:text-amber-400 transition-colors">
              ← Back to FIDS
            </Link>
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddForm((v) => !v)}
            className="text-xs border border-amber-700 text-amber-400 hover:bg-amber-900/30 px-4 py-2 rounded transition-colors"
          >
            {showAddForm ? 'Cancel' : '+ Add Flight'}
          </button>
          <button
            onClick={handleReset}
            className="text-xs border border-zinc-700 text-zinc-400 hover:bg-zinc-800 px-4 py-2 rounded transition-colors"
          >
            Reset to Seed
          </button>
        </div>
      </header>

      {/* Add flight form */}
      {showAddForm && (
        <div className="border-b border-board-border px-6 py-5 bg-zinc-900">
          <h2 className="text-xs text-amber-400 uppercase tracking-widest mb-4">New Flight</h2>
          <FlightEditor onAdded={() => setShowAddForm(false)} />
        </div>
      )}

      {/* Bulk action bar — sticky, appears when rows are selected */}
      <BulkStatusBar selectedIds={selectedIds} onClear={() => setSelectedIds([])} />

      {/* Flight list */}
      <div className="px-6 py-4">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs text-board-muted uppercase tracking-widest">
            {flights.length} flights total
          </span>
          {selectedIds.length === 0 ? (
            <button
              onClick={() => setSelectedIds(flights.map((f) => f.id))}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Select all
            </button>
          ) : (
            <span className="text-xs text-amber-400">{selectedIds.length} selected</span>
          )}
        </div>

        <div className="space-y-2">
          {flights.map((flight) => {
            const isSelected = selectedIds.includes(flight.id);
            return (
              <div
                key={flight.id}
                className={`bg-board-row border rounded px-4 py-3 transition-colors ${
                  isSelected ? 'border-amber-700 bg-amber-900/10' : 'border-board-border'
                }`}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Selection checkbox */}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(flight.id)}
                      className="accent-amber-500 w-3.5 h-3.5 shrink-0 cursor-pointer"
                      aria-label={`Select ${flight.flightNumber}`}
                    />
                    <span className="font-bold text-amber-300 text-sm shrink-0">
                      {flight.flightNumber}
                    </span>
                    <span className="text-zinc-500 text-xs shrink-0">{flight.airline}</span>
                    <span className="text-board-text text-sm truncate">{flight.destination}</span>
                    <span className="text-amber-100 text-sm tabular-nums shrink-0">
                      {flight.departureTime}
                    </span>
                    <span className="text-zinc-500 text-xs shrink-0">
                      {flight.terminal} / {flight.gate}
                    </span>
                  </div>

                  <button
                    onClick={() => handleRemove(flight.id)}
                    className="text-xs text-zinc-600 hover:text-red-400 transition-colors shrink-0"
                    title="Remove flight"
                  >
                    ✕
                  </button>
                </div>

                <div className="mt-2 flex flex-wrap items-end gap-4">
                  <StatusControl flight={flight} />
                  <DelayControl flight={flight} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
