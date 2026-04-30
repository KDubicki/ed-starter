import { NextResponse } from 'next/server';
import { readFlights, writeFlights } from '@/lib/flights';

// POST /api/flights/delay — set or clear delay on a specific flight
// Body: { id: string, delayMinutes: number } — delayMinutes: 0 clears the delay
export async function POST(request: Request) {
  const body = (await request.json()) as { id: string; delayMinutes: number };
  const { id, delayMinutes } = body;

  if (typeof delayMinutes !== 'number' || delayMinutes < 0) {
    return NextResponse.json(
      { error: 'delayMinutes must be a non-negative number' },
      { status: 400 },
    );
  }

  const flights = readFlights();
  const index = flights.findIndex((f) => f.id === id);

  if (index === -1) {
    return NextResponse.json({ error: 'Flight not found' }, { status: 404 });
  }

  if (flights[index].status === 'Cancelled') {
    return NextResponse.json(
      { error: 'Cannot delay a cancelled flight' },
      { status: 409 },
    );
  }

  const clearing = delayMinutes === 0;
  flights[index] = {
    ...flights[index],
    status: clearing ? 'On Time' : 'Delayed',
    delayMinutes: clearing ? undefined : delayMinutes,
  };

  writeFlights(flights);

  return NextResponse.json(flights[index]);
}
