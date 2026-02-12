/**
 * Game Module - Data Transfer Objects & Validation
 * Zod schemas for request validation
 */

import { z } from 'zod';
import { GameCategory, GameStatus } from './game.types';

// Create Game DTO
export const createGameSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(3, 'Title must be at least 3 characters')
      .max(255, 'Title must not exceed 255 characters')
      .trim(),
    
    description: z
      .string()
      .max(2000, 'Description must not exceed 2000 characters')
      .trim()
      .optional(),
    
    category: z.nativeEnum(GameCategory, {
      message: 'Category must be either ONLINE or OFFLINE'
    }),
    
    maxPlayers: z
      .number()
      .int('Max players must be an integer')
      .min(1, 'Max players must be at least 1')
      .max(1000, 'Max players cannot exceed 1000'),
    
    endTime: z
      .string()
      .refine((val) => {
        const date = new Date(val);
        return !isNaN(date.getTime());
      }, 'Invalid date format')
      .refine((val) => {
        const date = new Date(val);
        const now = new Date();
        const minEndTime = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes from now
        return date > minEndTime;
      }, 'End time must be at least 5 minutes from now')
      .refine((val) => {
        const date = new Date(val);
        const now = new Date();
        const maxEndTime = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year from now
        return date < maxEndTime;
      }, 'End time cannot be more than 365 days from now')
      .transform((val) => new Date(val))
  })
}).passthrough(); // Allow other fields like file uploads

// Update Game DTO
export const updateGameSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(3, 'Title must be at least 3 characters')
      .max(255, 'Title must not exceed 255 characters')
      .trim()
      .optional(),
    
    description: z
      .string()
      .max(2000, 'Description must not exceed 2000 characters')
      .trim()
      .optional(),
    
    maxPlayers: z
      .number()
      .int('Max players must be an integer')
      .min(1, 'Max players must be at least 1')
      .max(1000, 'Max players cannot exceed 1000')
      .optional(),
    
    endTime: z
      .string()
      .refine((val) => {
        const date = new Date(val);
        return !isNaN(date.getTime());
      }, 'Invalid date format')
      .refine((val) => {
        const date = new Date(val);
        const now = new Date();
        return date > now;
      }, 'End time must be in the future')
      .transform((val) => new Date(val))
      .optional()
  })
}).passthrough(); // Allow other fields like file uploads

// Query Parameters for Get All Games (Enhanced Discovery)
export const getGamesQuerySchema = z.object({
  query: z.object({
    category: z.nativeEnum(GameCategory).optional(),
    status: z.nativeEnum(GameStatus).optional(),
    creatorId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid creator ID format').optional(),
    search: z.string().max(100).optional(),
    availableSlots: z
      .string()
      .optional()
      .transform((val) => val === 'true'),
    minPlayers: z
      .string()
      .optional()
      .transform((val) => val ? parseInt(val, 10) : undefined)
      .refine((val) => !val || val > 0, 'Min players must be greater than 0'),
    maxPlayers: z
      .string()
      .optional()
      .transform((val) => val ? parseInt(val, 10) : undefined)
      .refine((val) => !val || val > 0, 'Max players must be greater than 0'),
    startTimeFrom: z
      .string()
      .optional()
      .transform((val) => val ? new Date(val) : undefined),
    startTimeTo: z
      .string()
      .optional()
      .transform((val) => val ? new Date(val) : undefined),
    includeEnded: z
      .string()
      .optional()
      .transform((val) => val === 'true'),
    sortBy: z.enum(['createdAt', 'startTime', 'endTime', 'popularity']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 1))
      .refine((val) => val > 0, 'Page must be greater than 0'),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 20))
      .refine((val) => val > 0 && val <= 100, 'Limit must be between 1 and 100')
  })
}).passthrough();

// Game ID Parameter Validation
export const gameIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid game ID format')
  })
}).passthrough();

// Type exports
export type CreateGameDTO = z.infer<typeof createGameSchema>['body'];
export type UpdateGameDTO = z.infer<typeof updateGameSchema>['body'];
export type GetGamesQueryDTO = z.infer<typeof getGamesQuerySchema>['query'];
export type GameIdParamDTO = z.infer<typeof gameIdParamSchema>['params'];
