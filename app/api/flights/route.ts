import { readFlights, writeFlights } from '@/lib/flights';
import { createFlightSchema, updateFlightSchema, deleteFlightSchema } from '@/lib/validations';
import { successResponse, validationErrorResponse, notFoundResponse } from '@/lib/apiResponse';
import type { Flight } from '@/types';

export async function GET() {
  const flights = readFlights();
  return successResponse(flights);
}

export async function PATCH(request: Request) {
  const raw: unknown = await request.json();
  const parsed = updateFlightSchema.safeParse(raw);

  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const { id, ...updates } = parsed.data;
  const flights = readFlights();
  const index = flights.findIndex((f) => f.id === id);

  if (index === -1) {
    return notFoundResponse('Flight');
  }

  flights[index] = { ...flights[index], ...updates } as Flight;
  writeFlights(flights);

  return successResponse(flights[index]);
}

export async function POST(request: Request) {
  const raw: unknown = await request.json();
  const parsed = createFlightSchema.safeParse(raw);

  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const flight = parsed.data as Flight;
  const flights = readFlights();
  flights.push(flight);
  writeFlights(flights);

  return successResponse(flight, 201);
}

export async function DELETE(request: Request) {
  const raw: unknown = await request.json();
  const parsed = deleteFlightSchema.safeParse(raw);

  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const { id } = parsed.data;
  const flights = readFlights();
  const index = flights.findIndex((f) => f.id === id);

  if (index === -1) {
    return notFoundResponse('Flight');
  }

  const updated = flights.filter((f) => f.id !== id);
  writeFlights(updated);

  return successResponse({ success: true });
}
