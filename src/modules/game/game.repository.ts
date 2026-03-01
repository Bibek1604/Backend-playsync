/**
 * Game Module - Repository Layer
 * Database operations for games
 */

import Game, { IGameDocument } from './game.model';
import { IGameFilters, IPaginationParams, GameStatus } from './game.types';
import mongoose from 'mongoose';

export interface IGameRepository {
  create(gameData: Partial<IGameDocument>): Promise<IGameDocument>;
  findById(id: string): Promise<IGameDocument | null>;
  findByIdWithCreator(id: string): Promise<IGameDocument | null>;
  findByIdWithParticipants(id: string): Promise<IGameDocument | null>;
  update(id: string, updateData: Partial<IGameDocument>): Promise<IGameDocument | null>;
  delete(id: string): Promise<boolean>;
  findAll(filters: IGameFilters, pagination: IPaginationParams): Promise<{ games: IGameDocument[], total: number }>;
  findByCreator(creatorId: string, filters: Partial<IGameFilters>, pagination: IPaginationParams): Promise<{ games: IGameDocument[], total: number }>;
  findByParticipant(userId: string, filters: Partial<IGameFilters>, pagination: IPaginationParams): Promise<{ games: IGameDocument[], total: number }>;
  findExpiredGames(currentTime: Date): Promise<IGameDocument[]>;
  addParticipant(gameId: string, userId: string): Promise<IGameDocument | null>;
  removeParticipant(gameId: string, userId: string): Promise<IGameDocument | null>;
  isUserParticipant(gameId: string, userId: string): Promise<boolean>;
}

export class GameRepository implements IGameRepository {
  
  async create(gameData: Partial<IGameDocument>): Promise<IGameDocument> {
    const game = new Game(gameData);
    return await game.save();
  }

  async findById(id: string): Promise<IGameDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await Game.findById(id);
  }

  async findByIdWithCreator(id: string): Promise<IGameDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await Game.findById(id).populate('creatorId', 'fullName email profilePicture');
  }

  async findByIdWithParticipants(id: string): Promise<IGameDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await Game.findById(id)
      .populate('creatorId', 'fullName email profilePicture')
      .populate('participants.userId', 'fullName email profilePicture');
  }

  async update(id: string, updateData: Partial<IGameDocument>): Promise<IGameDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await Game.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
  }

  async delete(id: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return false;
    }
    const result = await Game.findByIdAndDelete(id);
    return result !== null;
  }

  async findAll(
    filters: IGameFilters,
    pagination: IPaginationParams
  ): Promise<{ games: IGameDocument[], total: number }> {
    const query: any = {};

    // Apply filters
    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $all: filters.tags };
    }
    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.creatorId) {
      query.creatorId = new mongoose.Types.ObjectId(filters.creatorId);
    }
    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    const skip = (pagination.page - 1) * pagination.limit;

    const [games, total] = await Promise.all([
      Game.find(query)
        .populate('creatorId', 'fullName email profilePicture')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pagination.limit)
        .lean(),
      Game.countDocuments(query)
    ]);

    return { games: games as IGameDocument[], total };
  }

  async findByCreator(
    creatorId: string,
    filters: Partial<IGameFilters>,
    pagination: IPaginationParams
  ): Promise<{ games: IGameDocument[], total: number }> {
    const query: any = { creatorId: new mongoose.Types.ObjectId(creatorId) };

    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $all: filters.tags };
    }
    if (filters.status) {
      query.status = filters.status;
    }

    const skip = (pagination.page - 1) * pagination.limit;

    const [games, total] = await Promise.all([
      Game.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pagination.limit)
        .lean(),
      Game.countDocuments(query)
    ]);

    return { games: games as IGameDocument[], total };
  }

  async findByParticipant(
    userId: string,
    filters: Partial<IGameFilters>,
    pagination: IPaginationParams
  ): Promise<{ games: IGameDocument[], total: number }> {
    const query: any = {
      'participants.userId': new mongoose.Types.ObjectId(userId),
      'participants.status': 'ACTIVE'
    };

    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $all: filters.tags };
    }
    if (filters.status) {
      query.status = filters.status;
    }

    const skip = (pagination.page - 1) * pagination.limit;

    const [games, total] = await Promise.all([
      Game.find(query)
        .populate('creatorId', 'fullName email profilePicture')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pagination.limit)
        .lean(),
      Game.countDocuments(query)
    ]);

    return { games: games as IGameDocument[], total };
  }

  async findExpiredGames(currentTime: Date): Promise<IGameDocument[]> {
    return await Game.find({
      endTime: { $lte: currentTime },
      status: { $ne: GameStatus.ENDED }
    });
  }

  /**
   * Atomic join operation with race condition prevention (FIXED)
   */
  /**
   * Add participant to game atomically
   * SECURITY: Prevents race conditions with atomic findOneAndUpdate
   * - Checks all conditions atomically (status, slots, duplicates)
   * - Updates status to FULL atomically when capacity reached
   */
  async addParticipant(gameId: string, userId: string): Promise<IGameDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(gameId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return null;
    }

    // ATOMIC OPERATION 1: Add participant and increment counter
    const game = await Game.findOneAndUpdate(
      {
        _id: gameId,
        status: { $nin: [GameStatus.ENDED, GameStatus.FULL] },  // Not ended or full
        $expr: { $lt: ['$currentPlayers', '$maxPlayers'] },     // Has available slots
        'participants': {
          $not: {
            $elemMatch: {
              userId: new mongoose.Types.ObjectId(userId),
              status: 'ACTIVE'                                   // Not already active
            }
          }
        }
      },
      {
        $push: {
          participants: {
            userId: new mongoose.Types.ObjectId(userId),
            joinedAt: new Date(),
            status: 'ACTIVE'
          }
        },
        $inc: { currentPlayers: 1 }
      },
      { 
        new: true, 
        runValidators: true,
        populate: { path: 'creatorId', select: 'fullName email profilePicture' }
      }
    );

    if (!game) {
      return null;
    }

    // ATOMIC OPERATION 2: Update status to FULL if capacity reached
    // This prevents race condition where multiple joins could bypass FULL check
    if (game.currentPlayers >= game.maxPlayers) {
      const updatedGame = await Game.findOneAndUpdate(
        {
          _id: gameId,
          status: { $ne: GameStatus.ENDED },  // Don't update if already ended
          currentPlayers: { $gte: game.maxPlayers }  // Verify still at capacity
        },
        {
          $set: { status: GameStatus.FULL }
        },
        { 
          new: true,
          populate: { path: 'creatorId', select: 'fullName email profilePicture' }
        }
      );
      
      return updatedGame || game;  // Return updated or original
    }

    return game;
  }

  /**
   * Remove participant from game atomically
   * SECURITY: Prevents race conditions with atomic updates
   * - Updates participant status atomically
   * - Decrements counter atomically
   * - Updates game status from FULL to OPEN if needed
   */
  async removeParticipant(gameId: string, userId: string): Promise<IGameDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(gameId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return null;
    }

    // ATOMIC OPERATION 1: Mark participant as LEFT and decrement counter
    const game = await Game.findOneAndUpdate(
      {
        _id: gameId,
        'participants': {
          $elemMatch: {
            userId: new mongoose.Types.ObjectId(userId),
            status: 'ACTIVE'
          }
        }
      },
      {
        $set: {
          'participants.$.status': 'LEFT',
          'participants.$.leftAt': new Date()
        },
        $inc: { currentPlayers: -1 }
      },
      { 
        new: true,
        populate: { path: 'creatorId', select: 'fullName email profilePicture' }
      }
    );

    if (!game) {
      return null;
    }

    // ATOMIC OPERATION 2: Update status from FULL to OPEN if slot freed up
    if (game.status === GameStatus.FULL && game.currentPlayers < game.maxPlayers) {
      const updatedGame = await Game.findOneAndUpdate(
        {
          _id: gameId,
          status: GameStatus.FULL,
          currentPlayers: { $lt: game.maxPlayers }
        },
        {
          $set: { status: GameStatus.OPEN }
        },
        { 
          new: true,
          populate: { path: 'creatorId', select: 'fullName email profilePicture' }
        }
      );
      
      return updatedGame || game;  // Return updated or original
    }

    return game;
  }

  async isUserParticipant(gameId: string, userId: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(gameId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return false;
    }

    const game = await Game.findOne({
      _id: gameId,
      'participants': {
        $elemMatch: {
          userId: new mongoose.Types.ObjectId(userId),
          status: 'ACTIVE'
        }
      }
    }).select('_id');  // Only fetch ID for performance

    return game !== null;
  }

  /**
   * Check if user can join game
   */
  async canUserJoinGame(gameId: string, userId: string): Promise<{
    canJoin: boolean;
    reasons: string[];
    game?: IGameDocument;
  }> {
    const game = await Game.findById(gameId);
    
    if (!game) {
      return { canJoin: false, reasons: ['Game not found'] };
    }

    const reasons: string[] = [];

    if (game.status === GameStatus.ENDED) {
      reasons.push('Game has ended');
    }

    if (game.currentPlayers >= game.maxPlayers) {
      reasons.push('Game is full');
    }

    const isParticipant = game.participants.some(
      p => p.userId.toString() === userId && p.status === 'ACTIVE'
    );

    if (isParticipant) {
      reasons.push('Already joined this game');
    }

    return {
      canJoin: reasons.length === 0,
      reasons,
      game
    };
  }

  /**
   * Advanced discovery query with multiple filters
   */
  async findAllWithAdvancedFilters(
    filters: any,
    pagination: IPaginationParams
  ): Promise<{ games: IGameDocument[], total: number }> {
    const query = this.buildDiscoveryQuery(filters);
    const sort = this.buildSortQuery(filters.sortBy, filters.sortOrder);
    
    const skip = (pagination.page - 1) * pagination.limit;
    
    const [games, total] = await Promise.all([
      Game.find(query)
        .select('-participants -metadata')  // Exclude heavy fields for listing
        .populate('creatorId', 'fullName email profilePicture')
        .sort(sort)
        .skip(skip)
        .limit(pagination.limit)
        .lean(),
      Game.countDocuments(query)
    ]);
    
    return { games: games as IGameDocument[], total };
  }
  
  private buildDiscoveryQuery(filters: any): any {
    const query: any = {};
    
    // Status filter
    if (filters.status) query.status = filters.status;
    
    // Tags filter  
    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $all: filters.tags };
    }
    
    // Available slots filter
    if (filters.availableSlots) {
      query.$expr = { $lt: ['$currentPlayers', '$maxPlayers'] };
      if (!filters.status) {
        query.status = GameStatus.OPEN;
      }
    }
    
    // Capacity range
    if (filters.minPlayers || filters.maxPlayers) {
      query.maxPlayers = {};
      if (filters.minPlayers) query.maxPlayers.$gte = filters.minPlayers;
      if (filters.maxPlayers) query.maxPlayers.$lte = filters.maxPlayers;
    }
    
    // Time range
    if (filters.startTimeFrom || filters.startTimeTo) {
      query.startTime = {};
      if (filters.startTimeFrom) query.startTime.$gte = filters.startTimeFrom;
      if (filters.startTimeTo) query.startTime.$lte = filters.startTimeTo;
    }
    
    // Text search
    if (filters.search) {
      query.$text = { $search: filters.search };
    }
    
    // Creator filter
    if (filters.creatorId) {
      query.creatorId = new mongoose.Types.ObjectId(filters.creatorId);
    }
    
    // Exclude ended games by default
    if (!filters.includeEnded) {
      if (query.status) {
        if (query.status !== GameStatus.ENDED) {
          // Status already set to non-ENDED value
        } else {
          // User explicitly requested ENDED games
        }
      } else {
        query.status = { $ne: GameStatus.ENDED };
      }
    }
    
    return query;
  }
  
  private buildSortQuery(sortBy?: string, sortOrder: string = 'desc'): any {
    const order = sortOrder === 'asc' ? 1 : -1;
    
    switch (sortBy) {
      case 'startTime':
        return { startTime: order };
      case 'endTime':
        return { endTime: order };
      case 'popularity':
        return { currentPlayers: order, createdAt: -1 };
      case 'createdAt':
      default:
        return { createdAt: order };
    }
  }
}
