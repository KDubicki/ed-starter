import { NextResponse } from 'next/server';
import { readFlights } from '@/lib/flights';

// GET /api/flights/search?q=&terminal=&status=&airline=
// Query params:
//   q        — full-text search across flightNumber, destination, gate (case-insensitive)
//   terminal — filter by terminal (T1 | T2)
//   status   — filter by flight status
//   airline  — filter by airline name
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.toLowerCase() ?? '';
  const terminal = searchParams.get('terminal');
  const status = searchParams.get('status');
  const airline = searchParams.get('airline');

  let flights = readFlights();

  if (q) {
    flights = flights.filter(
      (f) =>
        f.flightNumber.toLowerCase().includes(q) ||
        f.destination.toLowerCase().includes(q) ||
        f.gate.toLowerCase().includes(q)
    );
  }

  if (terminal) {
    flights = flights.filter((f) => f.terminal === terminal);
  }

  if (status) {
    flights = flights.filter((f) => f.status === status);
  }

  if (airline) {
    flights = flights.filter((f) => f.airline.toLowerCase() === airline.toLowerCase());
  }

  return NextResponse.json({ results: flights, count: flights.length });
}
