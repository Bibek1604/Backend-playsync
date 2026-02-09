/**
 * Game Module - Controller Layer
 * HTTP request handlers for game operations
 */

import { Request, Response, NextFunction } from 'express';
import { GameService } from './game.service';
import { apiResponse } from '../../Share/utils/apiResponse';
import { AppError } from '../../Share/utils/AppError';

const gameService = new GameService();

export class GameController {
  
  /**
   * Create a new game
   * @route POST /api/games
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const gameData = req.body;
      const imageFile = req.file;

      const game = await gameService.createGame(userId, gameData, imageFile);

      res.status(201).json(
        apiResponse(true, 'Game created successfully', {
          game
        })
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all games with filters and pagination
   * @route GET /api/games
   */
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = {
        category: req.query.category as any,
        status: req.query.status as any,
        creatorId: req.query.creatorId as string,
        search: req.query.search as string
      };

      const pagination = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const result = await gameService.getAllGames(filters, pagination);

      res.status(200).json(
        apiResponse(true, 'Games retrieved successfully', result)
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get game by ID
   * @route GET /api/games/:id
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gameId = req.params.id;
      const includeDetails = req.query.details === 'true';

      const game = await gameService.getGameById(gameId, includeDetails);

      res.status(200).json(
        apiResponse(true, 'Game retrieved successfully', { game })
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get games created by authenticated user
   * @route GET /api/games/my/created
   */
  async getMyCreatedGames(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      const filters = {
        category: req.query.category as any,
        status: req.query.status as any
      };

      const pagination = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const result = await gameService.getMyCreatedGames(userId, filters, pagination);

      res.status(200).json(
        apiResponse(true, 'Created games retrieved successfully', result)
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get games joined by authenticated user
   * @route GET /api/games/my/joined
   */
  async getMyJoinedGames(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      const filters = {
        category: req.query.category as any,
        status: req.query.status as any
      };

      const pagination = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const result = await gameService.getMyJoinedGames(userId, filters, pagination);

      res.status(200).json(
        apiResponse(true, 'Joined games retrieved successfully', result)
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update game (creator only)
   * @route PATCH /api/games/:id
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gameId = req.params.id;
      const userId = (req as any).user?.id;
      const updateData = req.body;
      const imageFile = req.file;

      const game = await gameService.updateGame(gameId, userId, updateData, imageFile);

      res.status(200).json(
        apiResponse(true, 'Game updated successfully', { game })
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete game (creator only)
   * @route DELETE /api/games/:id
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gameId = req.params.id;
      const userId = (req as any).user?.id;

      await gameService.deleteGame(gameId, userId);

      res.status(200).json(
        apiResponse(true, 'Game deleted successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Join a game
   * @route POST /api/games/:id/join
   */
  async join(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gameId = req.params.id;
      const userId = (req as any).user?.id;

      const game = await gameService.joinGame(gameId, userId);

      res.status(200).json(
        apiResponse(true, 'Successfully joined the game', {
          gameId: game._id,
          currentPlayers: game.currentPlayers,
          status: game.status
        })
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Leave a game
   * @route POST /api/games/:id/leave
   */
  async leave(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gameId = req.params.id;
      const userId = (req as any).user?.id;

      const game = await gameService.leaveGame(gameId, userId);

      res.status(200).json(
        apiResponse(true, 'Successfully left the game', {
          gameId: game._id,
          currentPlayers: game.currentPlayers,
          status: game.status
        })
      );
    } catch (error) {
      next(error);
    }
  }
}
