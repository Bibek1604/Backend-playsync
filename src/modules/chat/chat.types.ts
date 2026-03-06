/**
 * Chat Module - TypeScript Types & Interfaces
 * Type definitions for chat functionality
 */

import { MessageType } from './chat.model';

/**
 * Chat message Data Transfer Object
 * 
 * REST API format (simplified):
 */
export interface ChatMessageDTO {
  _id: string;
  senderId: string;              // User ID of sender
  senderName: string;            // Full name of sender
  senderAvatar?: string;         // Avatar URL (optional)
  text: string;                  // Message content (was 'content')
  type: MessageType;
  createdAt: string;             // ISO 8601 timestamp
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
