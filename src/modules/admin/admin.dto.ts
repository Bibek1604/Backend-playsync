import { z } from 'zod';

// User list query schema
export const getUsersQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().default('1').transform(Number).pipe(z.number().int().min(1)),
    limit: z.string().optional().default('10').transform(Number).pipe(z.number().int().min(1).max(100)),
    search: z.string().optional(),
    sortBy: z.enum(['createdAt', 'lastLogin', 'fullName']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

export type GetUsersQueryDto = z.infer<typeof getUsersQuerySchema>['query'];

// Game list query schema
export const getGamesQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().default('1').transform(Number).pipe(z.number().int().min(1)),
    limit: z.string().optional().default('10').transform(Number).pipe(z.number().int().min(1).max(100)),
    status: z.enum(['OPEN', 'FULL', 'ENDED', 'CANCELLED']).optional(),
    category: z.enum(['ONLINE', 'OFFLINE']).optional(),
    creatorId: z.string().optional(),
    sortBy: z.enum(['createdAt', 'popularity', 'endTime']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

export type GetGamesQueryDto = z.infer<typeof getGamesQuerySchema>['query'];

// User ID param schema
export const userIdParamSchema = z.object({
  params: z.object({
    userId: z.string().min(1, 'User ID is required'),
  }),
});

export type UserIdParamDto = z.infer<typeof userIdParamSchema>['params'];

// Game ID param schema
export const gameIdParamSchema = z.object({
  params: z.object({
    gameId: z.string().min(1, 'Game ID is required'),
  }),
});

export type GameIdParamDto = z.infer<typeof gameIdParamSchema>['params'];
