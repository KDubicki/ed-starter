import { NextResponse } from 'next/server';
import { readFlights } from '@/lib/flights';
import type { FlightStatus, Terminal, Airline } from '@/types';

// GET /api/flights/stats — aggregated statistics across all flights
export async function GET() {
  const flights = readFlights();

  const byStatus = flights.reduce<Record<FlightStatus, number>>(
    (acc, f) => {
      acc[f.status] = (acc[f.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<FlightStatus, number>
  );

  const byTerminal = flights.reduce<Record<Terminal, number>>(
    (acc, f) => {
      acc[f.terminal] = (acc[f.terminal] ?? 0) + 1;
      return acc;
    },
    {} as Record<Terminal, number>
  );

  const byAirline = flights.reduce<Record<Airline, number>>(
    (acc, f) => {
      acc[f.airline] = (acc[f.airline] ?? 0) + 1;
      return acc;
    },
    {} as Record<Airline, number>
  );

  const delayed = flights.filter((f) => f.status === 'Delayed');
  const avgDelay =
    delayed.length > 0
      ? Math.round(delayed.reduce((sum, f) => sum + (f.delayMinutes ?? 0), 0) / delayed.length)
      : 0;

  return NextResponse.json({
    total: flights.length,
    byStatus,
    byTerminal,
    byAirline,
    delays: {
      count: delayed.length,
      averageMinutes: avgDelay,
    },
  });
}
