/**
 * User Game History - DTOs
 * Zod validation schemas for query parameters
 */

import { z } from 'zod';

/**
 * Query parameters schema for game history endpoint
 */
export const getGameHistoryQuerySchema = z.object({
  query: z.object({
    status: z
      .enum(['OPEN', 'FULL', 'ENDED', 'CANCELLED', 'ACTIVE', 'LEFT'])
      .optional()
      .describe('Filter by game status or participation status'),
    category: z
      .enum(['ONLINE', 'OFFLINE'])
      .optional()
      .describe('Filter by game category'),
    page: z
      .string()
      .optional()
      .default('1')
      .transform((val) => parseInt(val, 10))
      .refine((val) => val > 0, { message: 'Page must be greater than 0' })
      .describe('Page number for pagination'),
    limit: z
      .string()
      .optional()
      .default('10')
      .transform((val) => parseInt(val, 10))
      .refine((val) => val > 0 && val <= 50, {
        message: 'Limit must be between 1 and 50',
      })
      .describe('Number of items per page'),
    sort: z
      .enum(['recent', 'oldest', 'mostActive'])
      .optional()
      .default('recent')
      .describe('Sort order: recent (newest first), oldest (oldest first), or mostActive'),
  }),
});

export type GetGameHistoryQuery = z.infer<typeof getGameHistoryQuerySchema>['query'];
