import { readFlights, writeFlights } from '@/lib/flights';
import { successResponse, notFoundResponse } from '@/lib/apiResponse';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const flights = readFlights();
  const flight = flights.find((f) => f.id === id);

  if (!flight) {
    return notFoundResponse('Flight');
  }

  return successResponse(flight);
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const flights = readFlights();
  const exists = flights.some((f) => f.id === id);

  if (!exists) {
    return notFoundResponse('Flight');
  }

  const updated = flights.filter((f) => f.id !== id);
  writeFlights(updated);

  return successResponse({ success: true, deletedId: id });
}
