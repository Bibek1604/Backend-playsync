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
    if (filters.category) {
      query.category = filters.category;
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

    if (filters.category) {
      query.category = filters.category;
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

    if (filters.category) {
      query.category = filters.category;
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

  async addParticipant(gameId: string, userId: string): Promise<IGameDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(gameId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return null;
    }

    const game = await Game.findOneAndUpdate(
      {
        _id: gameId,
        status: { $ne: GameStatus.ENDED },
        currentPlayers: { $lt: mongoose.connection.model('Game').schema.path('maxPlayers') },
        'participants.userId': { $ne: userId }
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
      { new: true, runValidators: true }
    );

    return game;
  }

  async removeParticipant(gameId: string, userId: string): Promise<IGameDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(gameId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return null;
    }

    const game = await Game.findById(gameId);
    if (!game) return null;

    // Find the participant
    const participant = game.participants.find(
      p => p.userId.toString() === userId && p.status === 'ACTIVE'
    );

    if (!participant) return null;

    // Update participant status to LEFT
    participant.status = 'LEFT' as any;
    participant.leftAt = new Date();

    // Decrement current players
    game.currentPlayers = Math.max(0, game.currentPlayers - 1);

    // Update status if needed
    if (game.status === GameStatus.FULL && game.currentPlayers < game.maxPlayers) {
      game.status = GameStatus.OPEN;
    }

    await game.save();
    return game;
  }

  async isUserParticipant(gameId: string, userId: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(gameId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return false;
    }

    const game = await Game.findOne({
      _id: gameId,
      'participants.userId': new mongoose.Types.ObjectId(userId),
      'participants.status': 'ACTIVE'
    });

    return game !== null;
  }
}
