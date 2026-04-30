import { readFlights, writeFlights } from '@/lib/flights';
import { delayFlightSchema } from '@/lib/validations';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  notFoundResponse,
} from '@/lib/apiResponse';

export async function POST(request: Request) {
  const raw: unknown = await request.json();
  const parsed = delayFlightSchema.safeParse(raw);

  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const { id, delayMinutes } = parsed.data;
  const flights = readFlights();
  const index = flights.findIndex((f) => f.id === id);

  if (index === -1) {
    return notFoundResponse('Flight');
  }

  const flight = flights[index]!;

  if (flight.status === 'Cancelled') {
    return errorResponse('Cannot delay a cancelled flight', 409);
  }

  const clearing = delayMinutes === 0;
  flights[index] = {
    ...flight,
    status: clearing ? 'On Time' : 'Delayed',
    delayMinutes: clearing ? undefined : delayMinutes,
  };

  writeFlights(flights);

  return successResponse(flights[index]);
}
