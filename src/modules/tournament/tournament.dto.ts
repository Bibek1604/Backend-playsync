/**
 * Tournament Module - Data Transfer Objects & Validation
 */

import { z } from 'zod';
import { TournamentType, TournamentStatus } from './tournament.model';

export const createTournamentSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(3, 'Name must be at least 3 characters')
      .max(100, 'Name must not exceed 100 characters')
      .trim(),
    description: z
      .string()
      .min(10, 'Description must be at least 10 characters')
      .max(2000, 'Description must not exceed 2000 characters')
      .trim(),
    type: z.enum([TournamentType.ONLINE, TournamentType.OFFLINE]),
    location: z.string().trim().optional(),
    maxPlayers: z.coerce
      .number()
      .int()
      .min(2, 'At least 2 players required')
      .max(1000, 'Cannot exceed 1000 players'),
    entryFee: z.coerce.number().min(0, 'Entry fee cannot be negative'),
    prize: z.string().min(1, 'Prize details are required').max(500).trim(),
    startDate: z.string().refine((v) => !isNaN(Date.parse(v)), 'Invalid start date'),
    endDate: z
      .string()
      .refine((v) => !isNaN(Date.parse(v)), 'Invalid end date')
      .optional(),
  }).refine(
    (data) => {
      if (data.type === TournamentType.OFFLINE && !data.location?.trim()) {
        return false;
      }
      return true;
    },
    { message: 'Location is required for offline tournaments', path: ['location'] }
  ),
});

export const updateTournamentSchema = z.object({
  body: z.object({
    name: z.string().min(3).max(100).trim().optional(),
    description: z.string().max(2000).trim().optional(),
    location: z.string().trim().optional(),
    prize: z.string().max(500).trim().optional(),
    startDate: z.string().refine((v) => !isNaN(Date.parse(v)), 'Invalid start date').optional(),
    endDate: z.string().refine((v) => !isNaN(Date.parse(v)), 'Invalid end date').optional(),
    status: z.enum([
      TournamentStatus.OPEN,
      TournamentStatus.ONGOING,
      TournamentStatus.COMPLETED,
      TournamentStatus.CANCELLED,
    ]).optional(),
  }),
  params: z.object({ id: z.string() }),
});

export type CreateTournamentDTO = z.infer<typeof createTournamentSchema>['body'];
export type UpdateTournamentDTO = z.infer<typeof updateTournamentSchema>['body'];
