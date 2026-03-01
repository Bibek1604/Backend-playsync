/**
 * Chat Module - Service Layer
 * Business logic for chat operations
 */

import { ChatRepository } from './chat.repository';
import { MessageType, IChatMessageDocument } from './chat.model';
import { ChatMessageDTO, ChatHistoryResponse } from './chat.types';
import AppError from '../../Share/utils/AppError';
import { GameRepository } from '../game/game.repository';

export class ChatService {
  private chatRepository: ChatRepository;
  private gameRepository: GameRepository;
  
  constructor() {
    this.chatRepository = new ChatRepository();
    this.gameRepository = new GameRepository();
  }
  
  /**
   * Get chat history for a game
   */
  async getChatHistory(
    gameId: string,
    userId: string,
    limit: number,
    beforeCursor?: string
  ): Promise<ChatHistoryResponse> {
    // Verify game exists
    const game = await this.gameRepository.findById(gameId);
    if (!game) {
      throw new AppError('Game not found', 404);
    }
    
    // Verify user is active participant (already checked in middleware, but double-check)
    const isActive = game.participants.some(
      (p) => p.userId.toString() === userId && p.status === 'ACTIVE'
    );
    
    if (!isActive) {
      throw new AppError('You must be an active participant to view chat', 403);
    }
    
    // Fetch messages (limit + 1 to check if there are more)
    const messages = await this.chatRepository.findByGameId(gameId, limit + 1, beforeCursor);
    
    // Check if there are more messages
    const hasMore = messages.length > limit;
    const messagesToReturn = hasMore ? messages.slice(0, limit) : messages;
    
    // Transform to DTO
    const messageDTOs: ChatMessageDTO[] = messagesToReturn.map((msg: any) =>
      this.transformToDTO(msg)
    );
    
    // Next cursor is the createdAt of the last message
    const nextCursor = hasMore && messagesToReturn.length > 0
      ? messagesToReturn[messagesToReturn.length - 1].createdAt.toISOString()
      : undefined;
    
    return {
      messages: messageDTOs,
      hasMore,
      nextCursor
    };
  }
  
  /**
   * Create a user text message
   */
  async createTextMessage(
    gameId: string,
    userId: string,
    content: string
  ): Promise<IChatMessageDocument> {
    // Verify user is active participant
    const isActive = await this.gameRepository.isUserParticipant(gameId, userId);
    if (!isActive) {
      throw new AppError('You must be an active participant to send messages', 403);
    }
    
    // Sanitize content
    const sanitizedContent = this.sanitizeContent(content);
    
    // Create message
    const message = await this.chatRepository.create({
      game: gameId,
      user: userId,
      content: sanitizedContent,
      type: MessageType.TEXT
    });
    
    return message;
  }
  
  /**
   * Create a system message (join/leave notifications)
   */
  async createSystemMessage(gameId: string, content: string): Promise<IChatMessageDocument> {
    const message = await this.chatRepository.create({
      game: gameId,
      content,
      type: MessageType.SYSTEM
    });
    
    return message;
  }
  
  /**
   * Get populated message by ID (for broadcasting)
   */
  async getMessageById(messageId: string): Promise<ChatMessageDTO | null> {
    const message = await this.chatRepository.findByIdWithPopulate(messageId);
    if (!message) {
      return null;
    }
    
    return this.transformToDTO(message as any);
  }
  
  /**
   * Delete all chat messages for a game (when game is deleted)
   */
  async deleteGameChat(gameId: string): Promise<void> {
    await this.chatRepository.deleteByGame(gameId);
  }
  
  /**
   * Transform database document to DTO
   */
  private transformToDTO(message: any): ChatMessageDTO {
    return {
      _id: message._id.toString(),
      user: message.user
        ? {
            _id: message.user._id.toString(),
            username: message.user.username,
            fullName: message.user.fullName,
            profilePicture: message.user.profilePicture || undefined
          }
        : null,
      content: message.content,
      type: message.type,
      createdAt: message.createdAt.toISOString()
    };
  }
  
  /**
   * Sanitize message content to prevent XSS
   */
  private sanitizeContent(content: string): string {
    return content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
}
