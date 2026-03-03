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

// REST chat message validation schema
export const sendMessageSchema = z.object({
  body: z.object({
    content: z
      .string()
      .trim()
      .min(1, 'Message cannot be empty')
      .max(1500, 'Message cannot exceed 1500 characters')
  })
});

// Types derived from schemas
export type GetChatHistoryQuery = z.infer<typeof getChatHistoryQuerySchema>['query'];
export type GameIdParam = z.infer<typeof gameIdParamSchema>['params'];
export type SendChatMessage = z.infer<typeof sendChatMessageSchema>;
export type SendMessageBody = z.infer<typeof sendMessageSchema>['body'];

// Response DTO for client
// Shape matches chat.types.ts ChatMessageDTO
export interface ChatMessageDTO {
  _id: string;
  senderId: string;         // Flat user ID of sender
  senderName: string;       // Display name (fullName or username)
  senderAvatar?: string;    // Avatar URL (optional)
  text: string;             // Message content (field name is 'text', not 'content')
  type: MessageType;
  createdAt: string;        // ISO 8601 timestamp
}
