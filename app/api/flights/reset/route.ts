import { resetToSeed } from '@/lib/flights';
import { successResponse } from '@/lib/apiResponse';

export async function POST() {
  const flights = resetToSeed();
  return successResponse(flights);
}
