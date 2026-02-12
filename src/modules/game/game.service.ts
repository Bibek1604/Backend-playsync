/**
 * Game Module - Service Layer
 * Business logic for game operations
 */

import { GameRepository } from './game.repository';
import { IGameDocument } from './game.model';
import { CreateGameDTO, UpdateGameDTO } from './game.dto';
import AppError from '../../Share/utils/AppError';
import { uploadToCloudinary, deleteFromCloudinary } from './game.uploader';
import { GameStatus, IGameFilters, IPaginationParams, IGameDiscoveryFilters, IJoinEligibility } from './game.types';
import { GameEventsEmitter } from '../../websocket/game.events';
import { getSocketServer } from '../../websocket/socket.server';
import { emitSystemMessage } from '../chat/chat.socket';
import { ChatService } from '../chat/chat.service';

export class GameService {
  private gameRepository: GameRepository;
  private socketEmitter?: GameEventsEmitter;
  private chatService: ChatService;

  constructor(socketEmitter?: GameEventsEmitter) {
    this.gameRepository = new GameRepository();
    this.socketEmitter = socketEmitter;
    this.chatService = new ChatService();
  }

  /**
   * Create a new game
   */
  async createGame(
    creatorId: string,
    data: CreateGameDTO,
    imageFile?: Express.Multer.File
  ): Promise<IGameDocument> {
    let imageUrl: string | undefined;
    let imagePublicId: string | undefined;

    // Upload image to Cloudinary if provided
    if (imageFile) {
      try {
        const uploadResult = await uploadToCloudinary(imageFile.buffer, 'games');
        imageUrl = uploadResult.url;
        imagePublicId = uploadResult.publicId;
      } catch (error) {
        throw new AppError('Failed to upload game image', 500);
      }
    }

    // Create game
    const gameData = {
      ...data,
      creatorId,
      imageUrl,
      imagePublicId,
      currentPlayers: 0,
      status: GameStatus.OPEN,
      startTime: new Date()
    };

    try {
      const game = await this.gameRepository.create(gameData as any);
      
      // Emit real-time event
      if (this.socketEmitter) {
        this.socketEmitter.emitGameCreated(game._id.toString(), {
          id: game._id,
          title: game.title,
          category: game.category,
          status: game.status,
          maxPlayers: game.maxPlayers,
          currentPlayers: game.currentPlayers
        });
      }
      
      return game;
    } catch (error: any) {
      // Clean up uploaded image if game creation fails
      if (imagePublicId) {
        await deleteFromCloudinary(imagePublicId);
      }
      throw new AppError(error.message || 'Failed to create game', 500);
    }
  }

  /**
   * Get game by ID
   */
  async getGameById(gameId: string, includeDetails: boolean = false): Promise<IGameDocument> {
    const game = includeDetails
      ? await this.gameRepository.findByIdWithParticipants(gameId)
      : await this.gameRepository.findByIdWithCreator(gameId);

    if (!game) {
      throw new AppError('Game not found', 404);
    }

    return game;
  }

  /**
   * Get all games with filters and pagination (Enhanced Discovery)
   */
  async getAllGames(
    filters: IGameDiscoveryFilters,
    pagination: IPaginationParams
  ): Promise<{ games: IGameDocument[], pagination: any }> {
    const { games, total } = await this.gameRepository.findAllWithAdvancedFilters(filters, pagination);

    return {
      games,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
        hasNextPage: pagination.page < Math.ceil(total / pagination.limit),
        hasPreviousPage: pagination.page > 1
      }
    };
  }

  /**
   * Get games created by user
   */
  async getMyCreatedGames(
    creatorId: string,
    filters: Partial<IGameFilters>,
    pagination: IPaginationParams
  ): Promise<{ games: IGameDocument[], pagination: any }> {
    const { games, total } = await this.gameRepository.findByCreator(creatorId, filters, pagination);

    return {
      games,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit)
      }
    };
  }

  /**
   * Get games joined by user
   */
  async getMyJoinedGames(
    userId: string,
    filters: Partial<IGameFilters>,
    pagination: IPaginationParams
  ): Promise<{ games: IGameDocument[], pagination: any }> {
    const { games, total } = await this.gameRepository.findByParticipant(userId, filters, pagination);

    return {
      games,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit)
      }
    };
  }

  /**
   * Update game (creator only)
   */
  async updateGame(
    gameId: string,
    creatorId: string,
    data: UpdateGameDTO,
    imageFile?: Express.Multer.File
  ): Promise<IGameDocument> {
    const game = await this.gameRepository.findById(gameId);

    if (!game) {
      throw new AppError('Game not found', 404);
    }

    if (game.creatorId.toString() !== creatorId) {
      throw new AppError('Forbidden: Only creator can update this game', 403);
    }

    if (game.status === GameStatus.ENDED) {
      throw new AppError('Cannot update ended game', 409);
    }

    // Validate maxPlayers update
    if (data.maxPlayers && data.maxPlayers < game.currentPlayers) {
      throw new AppError(
        `Cannot reduce max players below current players (${game.currentPlayers})`,
        400
      );
    }

    // Validate endTime update (can only extend, not shorten)
    if (data.endTime && data.endTime < game.endTime) {
      throw new AppError('Cannot shorten game end time', 400);
    }

    let imageUrl = game.imageUrl;
    let imagePublicId = game.imagePublicId;

    // Handle image update
    if (imageFile) {
      try {
        // Upload new image
        const uploadResult = await uploadToCloudinary(imageFile.buffer, 'games');
        imageUrl = uploadResult.url;
        imagePublicId = uploadResult.publicId;

        // Delete old image
        if (game.imagePublicId) {
          await deleteFromCloudinary(game.imagePublicId);
        }
      } catch (error) {
        throw new AppError('Failed to upload new game image', 500);
      }
    }

    const updateData = {
      ...data,
      imageUrl,
      imagePublicId
    };

    const updatedGame = await this.gameRepository.update(gameId, updateData as any);

    if (!updatedGame) {
      throw new AppError('Failed to update game', 500);
    }

    return updatedGame;
  }

  /**
   * Delete game (creator only)
   */
  async deleteGame(gameId: string, creatorId: string): Promise<void> {
    const game = await this.gameRepository.findById(gameId);

    if (!game) {
      throw new AppError('Game not found', 404);
    }

    if (game.creatorId.toString() !== creatorId) {
      throw new AppError('Forbidden: Only creator can delete this game', 403);
    }

    // Delete image from Cloudinary
    if (game.imagePublicId) {
      await deleteFromCloudinary(game.imagePublicId);
    // Delete all chat messages for this game
    try {
      await this.chatService.deleteGameChat(gameId);
    } catch (error) {
      console.error('Failed to delete game chat messages:', error);
      // Continue with game deletion even if chat cleanup fails
    }

    }

    const deleted = await this.gameRepository.delete(gameId);

    if (!deleted) {
      throw new AppError('Failed to delete game', 500);
    }

    // Emit real-time event
    if (this.socketEmitter) {
      this.socketEmitter.emitGameDeleted(gameId);
    }
  }

  /**
   * Check if user can join game (eligibility check)
   */
  async checkJoinEligibility(gameId: string, userId: string): Promise<IJoinEligibility> {
    const result = await this.gameRepository.canUserJoinGame(gameId, userId);
    
    return {
      canJoin: result.canJoin,
      reasons: result.reasons,
      gameStatus: result.game?.status,
      availableSlots: result.game ? result.game.maxPlayers - result.game.currentPlayers : 0,
      isParticipant: result.reasons.includes('Already joined this game')
    };
  }

  /**
   * Join a game with full validation and concurrency handling
   */
  async joinGame(gameId: string, userId: string): Promise<IGameDocument> {
    // Pre-flight check
    const eligibility = await this.gameRepository.canUserJoinGame(gameId, userId);
    
    if (!eligibility.canJoin) {
      throw new AppError(eligibility.reasons[0], 400);
    }

    // Atomic join operation
    const updatedGame = await this.gameRepository.addParticipant(gameId, userId);

    if (!updatedGame) {
      // Failed due to race condition or capacity reached
      throw new AppError(
        'Failed to join game. Game may be full or you may have already joined.',
        409  // Conflict status code
      );
    }

    // Emit real-time event
    if (this.socketEmitter) {
      this.socketEmitter.emitPlayerJoined(
        gameId,
        { id: userId, username: 'User' },  // TODO: Get from user service
        updatedGame.currentPlayers,
        updatedGame.maxPlayers - updatedGame.currentPlayers
      );

      // If game became full, emit status change
      if (updatedGame.status === GameStatus.FULL) {
        this.socketEmitter.emitGameStatusChange(
          gameId,
          GameStatus.FULL,
          0
        );
      }

      // Emit system chat message about player joining
      try {
        const io = getSocketServer();
        await emitSystemMessage(io, gameId, `A player joined the game`);
      } catch (error) {
        console.error('Failed to emit join system message:', error);
      }
    }

    return updatedGame;
  }

  /**
   * Leave a game
   */
  async leaveGame(gameId: string, userId: string): Promise<IGameDocument> {
    const game = await this.gameRepository.findById(gameId);

    if (!game) {
      throw new AppError('Game not found', 404);
    }

    if (game.status === GameStatus.ENDED) {
      throw new AppError('Cannot leave ended game', 400);
    }

    // Check if user is a participant
    const isParticipant = await this.gameRepository.isUserParticipant(gameId, userId);
    if (!isParticipant) {
      throw new AppError('You are not a participant of this game', 400);
    }

    // Remove participant
    const updatedGame = await this.gameRepository.removeParticipant(gameId, userId);

    if (!updatedGame) {
      throw new AppError('Failed to leave game', 500);
    }

    // Emit real-time event
    if (this.socketEmitter) {
      this.socketEmitter.emitPlayerLeft(
        gameId,
        userId,
        updatedGame.currentPlayers,
        updatedGame.maxPlayers - updatedGame.currentPlayers
      );

      // If game transitioned from FULL to OPEN, emit status change
      if (updatedGame.status === GameStatus.OPEN && game.status === GameStatus.FULL) {
        this.socketEmitter.emitGameStatusChange(
          gameId,
          GameStatus.OPEN,
          updatedGame.maxPlayers - updatedGame.currentPlayers
        );
      }

      // Emit system chat message about player leaving
      try {
        const io = getSocketServer();
        await emitSystemMessage(io, gameId, `A player left the game`);
      } catch (error) {
        console.error('Failed to emit leave system message:', error);
      }
    }

    return updatedGame;
  }

  /**
   * End a game (called by cron job or manually)
   */
  async endGame(gameId: string): Promise<void> {
    const game = await this.gameRepository.findById(gameId);

    if (!game || game.status === GameStatus.ENDED) {
      return; // Already ended or doesn't exist
    }

    await this.gameRepository.update(gameId, {
      status: GameStatus.ENDED,
      endedAt: new Date()
    } as any);
  }

  /**
   * Find and end expired games (called by cron job)
   */
  async endExpiredGames(): Promise<number> {
    const currentTime = new Date();
    const expiredGames = await this.gameRepository.findExpiredGames(currentTime);

    for (const game of expiredGames) {
      await this.endGame(game._id.toString());
    }

    return expiredGames.length;
  }
}
