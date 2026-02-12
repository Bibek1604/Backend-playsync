/**
 * Chat Module - Repository Layer
 * Database operations for chat messages
 */

import ChatMessage, { IChatMessageDocument, MessageType } from './chat.model';
import mongoose from 'mongoose';

export interface IChatRepository {
  create(messageData: {
    game: string;
    user?: string;
    content: string;
    type: MessageType;
  }): Promise<IChatMessageDocument>;
  
  findByGameId(
    gameId: string,
    limit: number,
    beforeCursor?: string
  ): Promise<IChatMessageDocument[]>;
  
  findByIdWithPopulate(messageId: string): Promise<IChatMessageDocument | null>;
  
  countByGame(gameId: string): Promise<number>;
  
  deleteByGame(gameId: string): Promise<number>;
}

export class ChatRepository implements IChatRepository {
  
  /**
   * Create a new chat message
   */
  async create(messageData: {
    game: string;
    user?: string;
    content: string;
    type: MessageType;
  }): Promise<IChatMessageDocument> {
    const message = new ChatMessage({
      game: new mongoose.Types.ObjectId(messageData.game),
      user: messageData.user ? new mongoose.Types.ObjectId(messageData.user) : undefined,
      content: messageData.content,
      type: messageData.type
    });
    
    return await message.save();
  }
  
  /**
   * Get chat history for a game (newest first with cursor pagination)
   * Cursor is based on createdAt timestamp, not message ID
   */
  async findByGameId(
    gameId: string,
    limit: number,
    beforeCursor?: string
  ): Promise<IChatMessageDocument[]> {
    if (!mongoose.Types.ObjectId.isValid(gameId)) {
      return [];
    }
    
    const query: any = { game: new mongoose.Types.ObjectId(gameId) };
    
    // Cursor-based pagination using createdAt timestamp
    if (beforeCursor) {
      const beforeDate = new Date(beforeCursor);
      if (!isNaN(beforeDate.getTime())) {
        query.createdAt = { $lt: beforeDate };
      }
    }
    
    return await ChatMessage.find(query)
      .sort({ createdAt: -1 }) // Newest first
      .limit(limit)
      .populate('user', 'username fullName profilePicture') // Populate user fields
      .lean()
      .exec();
  }
  
  /**
   * Find message by ID with user populated (for broadcasting)
   */
  async findByIdWithPopulate(messageId: string): Promise<IChatMessageDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return null;
    }
    
    return await ChatMessage.findById(messageId)
      .populate('user', 'username fullName profilePicture')
      .lean()
      .exec();
  }
  
  /**
   * Count total messages in a game
   */
  async countByGame(gameId: string): Promise<number> {
    if (!mongoose.Types.ObjectId.isValid(gameId)) {
      return 0;
    }
    
    return await ChatMessage.countDocuments({
      game: new mongoose.Types.ObjectId(gameId)
    });
  }
  
  /**
   * Delete all messages for a game (cleanup when game is deleted)
   */
  async deleteByGame(gameId: string): Promise<number> {
    if (!mongoose.Types.ObjectId.isValid(gameId)) {
      return 0;
    }
    
    const result = await ChatMessage.deleteMany({
      game: new mongoose.Types.ObjectId(gameId)
    });
    
    return result.deletedCount || 0;
  }
}
