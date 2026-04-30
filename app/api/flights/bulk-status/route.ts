import { readFlights, writeFlights } from '@/lib/flights';
import { bulkStatusSchema } from '@/lib/validations';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/apiResponse';
import type { Flight, FlightStatus } from '@/types';

export async function PATCH(request: Request) {
  const raw: unknown = await request.json();
  const parsed = bulkStatusSchema.safeParse(raw);

  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const { ids, status: newStatus } = parsed.data;
  const typedStatus = newStatus as FlightStatus;
  const flights = readFlights();
  const missing = ids.filter((id) => !flights.some((f) => f.id === id));

  if (missing.length > 0) {
    return errorResponse('Some flights not found', 404, { missing });
  }

  const updated: Flight[] = flights.map((f) =>
    ids.includes(f.id)
      ? {
          ...f,
          status: typedStatus,
          delayMinutes: typedStatus !== 'Delayed' ? undefined : f.delayMinutes,
        }
      : f
  );

  writeFlights(updated);

  const affected = updated.filter((f) => ids.includes(f.id));
  return successResponse({ updated: affected, count: affected.length });
}
