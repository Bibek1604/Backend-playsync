/**
 * Chat Module - Socket.IO Handlers
 * Real-time WebSocket event handlers for chat
 */

import { Server as SocketServer, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { sendChatMessageSchema } from './chat.dto';
import { RateLimitEntry, SendChatMessagePayload, ChatMessageAcknowledgment } from './chat.types';
import logger from '../../Share/utils/logger';

// Rate limiting: in-memory map { userId: { count: number, resetAt: number } }
const rateLimitMap = new Map<string, RateLimitEntry>();

// Rate limit config
const RATE_LIMIT_MAX = 8; // messages
const RATE_LIMIT_WINDOW = 15000; // 15 seconds

/**
 * Check rate limit for user
 */
function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);
  
  if (!userLimit || now > userLimit.resetAt) {
    // Reset or initialize
    rateLimitMap.set(userId, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW
    });
    return true;
  }
  
  if (userLimit.count >= RATE_LIMIT_MAX) {
    return false; // Rate limited
  }
  
  userLimit.count++;
  return true;
}

/**
 * Clean up expired rate limit entries (run periodically)
 */
function cleanupRateLimits() {
  const now = Date.now();
  for (const [userId, limit] of rateLimitMap.entries()) {
    if (now > limit.resetAt) {
      rateLimitMap.delete(userId);
    }
  }
}

// Cleanup every minute
setInterval(cleanupRateLimits, 60000);

/**
 * Initialize chat socket handlers
 */
export function initializeChatHandlers(io: SocketServer): void {
  const chatService = new ChatService();
  
  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    
    if (!user) {
      logger.warn(`Socket ${socket.id} has no user attached`);
      return;
    }
    
    /**
     * Handle chat message send
     * Event: 'chat:send'
     * Payload: { gameId: string, content: string }
     * Acknowledgment: { success: boolean, error?: string, messageId?: string }
     */
    socket.on('chat:send', async (payload: SendChatMessagePayload, callback) => {
      try {
        // Validate payload
        const validation = sendChatMessageSchema.safeParse(payload);
        
        if (!validation.success) {
          const error = validation.error.issues[0]?.message || 'Invalid message data';
          const ack: ChatMessageAcknowledgment = { success: false, error };
          if (callback) callback(ack);
          return;
        }
        
        const { gameId, content } = validation.data;
        
        // Rate limiting
        if (!checkRateLimit(user.id)) {
          const ack: ChatMessageAcknowledgment = {
            success: false,
            error: `Rate limit exceeded. Max ${RATE_LIMIT_MAX} messages per ${RATE_LIMIT_WINDOW / 1000} seconds.`
          };
          if (callback) callback(ack);
          return;
        }
        
        // Create message in database
        const message = await chatService.createTextMessage(gameId, user.id, content);
        
        // Get populated message for broadcasting
        const messageDTO = await chatService.getMessageById(message._id.toString());
        
        if (!messageDTO) {
          const ack: ChatMessageAcknowledgment = { success: false, error: 'Failed to retrieve message' };
          if (callback) callback(ack);
          return;
        }
        
        // Broadcast to game room (including sender)
        io.to(`game:${gameId}`).emit('chat:message', messageDTO);
        
        // Acknowledge success
        const ack: ChatMessageAcknowledgment = { success: true, messageId: message._id.toString() };
        if (callback) callback(ack);
        
        logger.info(`Chat message sent in game ${gameId} by user ${user.id}`);
      } catch (error: any) {
        logger.error('Error handling chat:send:', error);
        
        const ack: ChatMessageAcknowledgment = {
          success: false,
          error: error.message || 'Failed to send message'
        };
        if (callback) callback(ack);
      }
    });
  });
  
  logger.info('✅ Chat socket handlers initialized');
}

/**
 * Emit system message to game room
 * Called from game service when users join/leave
 */
export async function emitSystemMessage(
  io: SocketServer,
  gameId: string,
  content: string
): Promise<void> {
  try {
    const chatService = new ChatService();
    
    // Create system message in database
    const message = await chatService.createSystemMessage(gameId, content);
    
    // Get populated message
    const messageDTO = await chatService.getMessageById(message._id.toString());
    
    if (messageDTO) {
      // Broadcast to game room
      io.to(`game:${gameId}`).emit('chat:message', messageDTO);
      
      logger.info(`System message broadcast to game ${gameId}: ${content}`);
    }
  } catch (error: any) {
    logger.error('Error emitting system message:', error?.message || error);
    // Don't throw - system messages are non-critical
  }
}
