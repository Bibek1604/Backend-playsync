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
    return await Game.findOne({ _id: id, isDeleted: { $ne: true } });
  }

  async findByIdWithCreator(id: string): Promise<IGameDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await Game.findOne({ _id: id, isDeleted: { $ne: true } }).populate('creatorId', 'fullName email profilePicture');
  }

  async findByIdWithParticipants(id: string): Promise<IGameDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await Game.findOne({ _id: id, isDeleted: { $ne: true } })
      .populate('creatorId', 'fullName email profilePicture')
      .populate('participants.userId', 'fullName email profilePicture');
  }

  async update(id: string, updateData: Partial<IGameDocument>): Promise<IGameDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await Game.findOneAndUpdate(
      { _id: id, isDeleted: { $ne: true } },
      { $set: updateData },
      { new: true, runValidators: true }
    );
  }

  async delete(id: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return false;
    }
    const result = await Game.findByIdAndUpdate(id, { $set: { isDeleted: true } });
    return result !== null;
  }

  async findAll(
    filters: IGameFilters,
    pagination: IPaginationParams
  ): Promise<{ games: IGameDocument[], total: number }> {
    const query: any = { isDeleted: { $ne: true } };

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
    const query: any = {
      creatorId: new mongoose.Types.ObjectId(creatorId),
      isDeleted: { $ne: true }
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

  async findByParticipant(
    userId: string,
    filters: Partial<IGameFilters>,
    pagination: IPaginationParams
  ): Promise<{ games: IGameDocument[], total: number }> {
    const query: any = {
      'participants.userId': new mongoose.Types.ObjectId(userId),
      'participants.status': 'ACTIVE',
      creatorId: { $ne: new mongoose.Types.ObjectId(userId) },
      isDeleted: { $ne: true }
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
      status: { $ne: GameStatus.ENDED },
      isDeleted: { $ne: true }
    });
  }

  async addParticipant(gameId: string, userId: string): Promise<IGameDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(gameId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return null;
    }

    const game = await Game.findOneAndUpdate(
      {
        _id: gameId,
        isDeleted: { $ne: true },
        status: { $nin: [GameStatus.ENDED, GameStatus.FULL] },
        $expr: { $lt: ['$currentPlayers', '$maxPlayers'] },
        'participants': {
          $not: {
            $elemMatch: {
              userId: new mongoose.Types.ObjectId(userId),
              status: 'ACTIVE'
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

    if (game.currentPlayers >= game.maxPlayers) {
      const updatedGame = await Game.findOneAndUpdate(
        {
          _id: gameId,
          isDeleted: { $ne: true },
          status: { $ne: GameStatus.ENDED },
          currentPlayers: { $gte: game.maxPlayers }
        },
        {
          $set: { status: GameStatus.FULL }
        },
        {
          new: true,
          populate: { path: 'creatorId', select: 'fullName email profilePicture' }
        }
      );

      return updatedGame || game;
    }

    return game;
  }

  async removeParticipant(gameId: string, userId: string): Promise<IGameDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(gameId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return null;
    }

    const game = await Game.findOneAndUpdate(
      {
        _id: gameId,
        isDeleted: { $ne: true },
        'participants': { $elemMatch: { userId: new mongoose.Types.ObjectId(userId), status: 'ACTIVE' } }
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

    if (game.status === GameStatus.FULL && game.currentPlayers < game.maxPlayers) {
      const updatedGame = await Game.findOneAndUpdate(
        {
          _id: gameId,
          isDeleted: { $ne: true },
          status: GameStatus.FULL,
          currentPlayers: { $lt: game.maxPlayers }
        },
        { $set: { status: GameStatus.OPEN } },
        {
          new: true,
          populate: { path: 'creatorId', select: 'fullName email profilePicture' }
        }
      );

      return updatedGame || game;
    }

    return game;
  }

  async isUserParticipant(gameId: string, userId: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(gameId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return false;
    }

    const game = await Game.findOne({
      _id: gameId,
      isDeleted: { $ne: true },
      'participants': {
        $elemMatch: {
          userId: new mongoose.Types.ObjectId(userId),
          status: 'ACTIVE'
        }
      }
    }).select('_id');

    return game !== null;
  }

  async canUserJoinGame(gameId: string, userId: string): Promise<{
    canJoin: boolean;
    reasons: string[];
    game?: IGameDocument;
  }> {
    const game = await Game.findOne({ _id: gameId, isDeleted: { $ne: true } });

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

  async findAllWithAdvancedFilters(
    filters: any,
    pagination: IPaginationParams
  ): Promise<{ games: IGameDocument[], total: number }> {
    const query = this.buildDiscoveryQuery(filters);
    const hasGeospatial = !!query.location;
    const sort = hasGeospatial ? {} : this.buildSortQuery(filters.sortBy, filters.sortOrder);

    const countQuery = JSON.parse(JSON.stringify(query));
    if (hasGeospatial && countQuery.location?.$nearSphere) {
      const nearSphere = countQuery.location.$nearSphere;
      countQuery.location = {
        $geoWithin: {
          $centerSphere: [
            nearSphere.$geometry.coordinates,
            nearSphere.$maxDistance / 6378100
          ]
        }
      };
    }

    const skip = (pagination.page - 1) * pagination.limit;

    const [games, total] = await Promise.all([
      Game.find(query)
        .select('-participants -metadata')
        .populate('creatorId', 'fullName email profilePicture')
        .sort(sort)
        .skip(skip)
        .limit(pagination.limit)
        .lean(),
      Game.countDocuments(countQuery)
    ]);

    return { games: games as IGameDocument[], total };
  }

  private buildDiscoveryQuery(filters: any): any {
    const query: any = { isDeleted: { $ne: true } };

    if (filters.status) query.status = filters.status;
    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $all: filters.tags };
    }
    if (filters.availableSlots) {
      query.$expr = { $lt: ['$currentPlayers', '$maxPlayers'] };
      if (!filters.status) {
        query.status = GameStatus.OPEN;
      }
    }
    if (filters.minPlayers || filters.maxPlayers) {
      query.maxPlayers = {};
      if (filters.minPlayers) query.maxPlayers.$gte = filters.minPlayers;
      if (filters.maxPlayers) query.maxPlayers.$lte = filters.maxPlayers;
    }
    if (filters.startTimeFrom || filters.startTimeTo) {
      query.startTime = {};
      if (filters.startTimeFrom) query.startTime.$gte = filters.startTimeFrom;
      if (filters.startTimeTo) query.startTime.$lte = filters.startTimeTo;
    }
    if (filters.search) {
      query.$text = { $search: filters.search };
    }
    if (filters.creatorId) {
      query.creatorId = new mongoose.Types.ObjectId(filters.creatorId);
    }
    if (!filters.includeEnded) {
      if (query.status) {
        if (query.status !== GameStatus.ENDED) { }
      } else {
        query.status = { $ne: GameStatus.ENDED };
      }
    }
    if (filters.category) query.category = filters.category;
    if (filters.excludeUserId) {
      const userId = new mongoose.Types.ObjectId(filters.excludeUserId);
      query.creatorId = { $ne: userId };
      query['participants.userId'] = { $ne: userId };
    }
    if (filters.latitude && filters.longitude) {
      const radiusInMeters = (filters.radius || 10) * 1000;
      query.location = {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(filters.longitude), Number(filters.latitude)]
          },
          $maxDistance: radiusInMeters
        }
      };
    }
    return query;
  }

  private buildSortQuery(sortBy?: string, sortOrder: string = 'desc'): any {
    const order = sortOrder === 'asc' ? 1 : -1;
    switch (sortBy) {
      case 'startTime': return { startTime: order };
      case 'endTime': return { endTime: order };
      case 'popularity': return { currentPlayers: order, createdAt: -1 };
      case 'distance': return {};
      case 'createdAt':
      default: return { createdAt: order };
    }
  }
}
