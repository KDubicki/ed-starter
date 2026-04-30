import { z } from 'zod';
import { ALL_AIRLINES, ALL_STATUSES, ALL_TERMINALS } from '@/types';

// ─── Shared Schemas ─────────────────────────────────────────────────────────

export const flightStatusSchema = z.enum(ALL_STATUSES);
export const terminalSchema = z.enum(ALL_TERMINALS);
export const airlineSchema = z.enum(ALL_AIRLINES);

export const flightSchema = z.object({
  id: z.string().min(1),
  flightNumber: z
    .string()
    .min(2)
    .regex(/^[A-Z0-9]{2,3}\s?\d{1,4}$/i, 'Invalid flight number format'),
  airline: airlineSchema,
  destination: z.string().min(2).max(50),
  departureTime: z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:MM format'),
  terminal: terminalSchema,
  gate: z.string().min(1).max(10),
  status: flightStatusSchema,
  delayMinutes: z.number().int().min(0).optional(),
});

// ─── API-specific Schemas ────────────────────────────────────────────────────

export const createFlightSchema = flightSchema;

export const updateFlightSchema = z
  .object({
    id: z.string().min(1),
  })
  .and(flightSchema.partial().omit({ id: true }));

export const deleteFlightSchema = z.object({
  id: z.string().min(1),
});

export const delayFlightSchema = z.object({
  id: z.string().min(1),
  delayMinutes: z.number().int().min(0),
});

export const bulkStatusSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
  status: flightStatusSchema,
});
