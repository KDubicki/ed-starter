import { NextResponse } from 'next/server';
import type { z } from 'zod';

type ApiErrorBody = {
  error: string;
  details?: Record<string, string[]>;
};

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function errorResponse(message: string, status: number, details?: Record<string, string[]>) {
  const body: ApiErrorBody = { error: message };
  if (details) body.details = details;
  return NextResponse.json(body, { status });
}

export function validationErrorResponse(error: z.ZodError) {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.') || '_root';
    fieldErrors[path] = fieldErrors[path] ?? [];
    fieldErrors[path].push(issue.message);
  }
  return errorResponse('Validation failed', 422, fieldErrors);
}

export function notFoundResponse(resource = 'Resource') {
  return errorResponse(`${resource} not found`, 404);
}
