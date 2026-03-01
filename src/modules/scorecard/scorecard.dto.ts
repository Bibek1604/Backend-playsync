/**
 * Scorecard Module - DTOs
 * Zod validation schemas for query parameters
 */

import { z } from 'zod';

/**
 * Query parameters schema for leaderboard endpoint
 */
export const getLeaderboardQuerySchema = z.object({
  query: z.object({
    limit: z
      .string()
      .optional()
      .default('50')
      .transform((val) => parseInt(val, 10))
      .refine((val) => val > 0 && val <= 200, {
        message: 'Limit must be between 1 and 200',
      })
      .describe('Number of items per page'),
    page: z
      .string()
      .optional()
      .default('1')
      .transform((val) => parseInt(val, 10))
      .refine((val) => val > 0, { message: 'Page must be greater than 0' })
      .describe('Page number for pagination'),
    period: z
      .enum(['all', 'monthly'])
      .optional()
      .default('all')
      .describe('Time period filter'),
  }),
});

export type GetLeaderboardQuery = z.infer<typeof getLeaderboardQuerySchema>['query'];
