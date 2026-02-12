/**
 * Chat Module - Data Transfer Objects & Validation
 * Zod schemas for chat operations
 */

import { z } from 'zod';
import { MessageType } from './chat.model';

// Get chat history query parameters
export const getChatHistoryQuerySchema = z.object({
  query: z.object({
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 50))
      .refine((val) => val >= 1 && val <= 100, {
        message: 'Limit must be between 1 and 100'
      }),
    
    before: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Date.parse(val)), {
        message: 'Invalid timestamp format'
      })
  })
});

// Game ID parameter validation
export const gameIdParamSchema = z.object({
  params: z.object({
    gameId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid game ID format')
  })
});

// Socket chat message validation schema (for runtime)
export const sendChatMessageSchema = z.object({
  gameId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid game ID format'),
  
  content: z
    .string()
    .trim()
    .min(1, 'Message cannot be empty')
    .max(1500, 'Message cannot exceed 1500 characters')
});

// Types derived from schemas
export type GetChatHistoryQuery = z.infer<typeof getChatHistoryQuerySchema>['query'];
export type GameIdParam = z.infer<typeof gameIdParamSchema>['params'];
export type SendChatMessage = z.infer<typeof sendChatMessageSchema>;

// Response DTO for client
export interface ChatMessageDTO {
  _id: string;
  user: {
    _id: string;
    username: string;
    fullName: string;
    profilePicture?: string;
  } | null;
  content: string;
  type: MessageType;
  createdAt: string;
}
