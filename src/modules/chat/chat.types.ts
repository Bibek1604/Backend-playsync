/**
 * Chat Module - TypeScript Types & Interfaces
 * Type definitions for chat functionality
 */

import { MessageType } from './chat.model';

/**
 * Chat message Data Transfer Object
 */
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

/**
 * Socket.IO chat events payload types
 */
export interface SendChatMessagePayload {
  gameId: string;
  content: string;
}

export interface ChatMessageAcknowledgment {
  success: boolean;
  error?: string;
  messageId?: string;
}

/**
 * Chat history response
 */
export interface ChatHistoryResponse {
  messages: ChatMessageDTO[];
  hasMore: boolean;
  nextCursor?: string;
}

/**
 * Rate limit entry for in-memory tracking
 */
export interface RateLimitEntry {
  count: number;
  resetAt: number;
}
