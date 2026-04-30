import { NextResponse } from 'next/server';
import { readFlights, writeFlights } from '@/lib/flights';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/flights/:id — get single flight by id
export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const flights = readFlights();
  const flight = flights.find((f) => f.id === id);

  if (!flight) {
    return NextResponse.json({ error: 'Flight not found' }, { status: 404 });
  }

  return NextResponse.json(flight);
}

// DELETE /api/flights/:id — remove a flight by id (route param)
export async function DELETE(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const flights = readFlights();
  const exists = flights.some((f) => f.id === id);

  if (!exists) {
    return NextResponse.json({ error: 'Flight not found' }, { status: 404 });
  }

  const updated = flights.filter((f) => f.id !== id);
  writeFlights(updated);

  return NextResponse.json({ success: true, deletedId: id });
}
