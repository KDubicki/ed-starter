import { NextResponse } from 'next/server';
import { readFlights, writeFlights } from '@/lib/flights';
import type { FlightStatus } from '@/types';

// PATCH /api/flights/bulk-status — update status for multiple flights at once
// Body: { ids: string[], status: FlightStatus }
export async function PATCH(request: Request) {
  const body = (await request.json()) as { ids: string[]; status: FlightStatus };
  const { ids, status } = body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'ids must be a non-empty array' }, { status: 400 });
  }

  const flights = readFlights();
  const missing = ids.filter((id) => !flights.some((f) => f.id === id));

  if (missing.length > 0) {
    return NextResponse.json(
      { error: 'Some flights not found', missing },
      { status: 404 },
    );
  }

  const updated = flights.map((f) =>
    ids.includes(f.id)
      ? { ...f, status, delayMinutes: status !== 'Delayed' ? undefined : f.delayMinutes }
      : f,
  );

  writeFlights(updated);

  const affected = updated.filter((f) => ids.includes(f.id));
  return NextResponse.json({ updated: affected, count: affected.length });
}
