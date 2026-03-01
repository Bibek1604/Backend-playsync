/**
 * Game Module - Controller Layer
 * HTTP request handlers for game operations
 */

import { Request, Response, NextFunction } from 'express';
import { apiResponse } from '../../Share/utils/apiResponse';
import { getGameService } from './game.service.factory';

export class GameController {
  
  /**
   * @swagger
   * /api/v1/games:
   *   post:
   *     tags:
   *       - Games
   *     summary: Create a new game
   *     description: Create a new game with optional image upload. Requires authentication.
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             required:
   *               - title
   *               - tags
   *               - maxPlayers
   *               - endTime
   *             properties:
   *               title:
   *                 type: string
   *                 minLength: 3
   *                 maxLength: 255
   *                 example: Friday Night Battle
   *               description:
   *                 type: string
   *                 maxLength: 2000
   *                 example: Weekly competitive match for all skill levels
   *               tags:
   *                 type: array
   *                 description: Game tags (1-10 tags, 2-30 chars each)
   *                 minItems: 1
   *                 maxItems: 10
   *                 items:
   *                   type: string
   *                   minLength: 2
   *                   maxLength: 30
   *                 example: ["valorant", "ranked", "online"]
   *               maxPlayers:
   *                 type: integer
   *                 minimum: 1
   *                 maximum: 1000
   *                 example: 50
   *               endTime:
   *                 type: string
   *                 format: date-time
   *                 example: 2026-02-10T22:00:00Z
   *               image:
   *                 type: string
   *                 format: binary
   *                 description: Game image (max 5MB, jpg/png/webp)
   *     responses:
   *       201:
   *         description: Game created successfully
   *       400:
   *         description: Invalid input data
   *       401:
   *         description: Unauthorized - JWT token required
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gameService = getGameService();
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
   * @swagger
   * /api/v1/games:
   *   get:
   *     tags:
   *       - Games
   *     summary: Get all games
   *     description: Retrieve all games with optional filtering and pagination
   *     parameters:
   *       - in: query
   *         name: tags
   *         schema:
   *           type: string
   *         description: Filter by tags (comma-separated, e.g., "valorant,ranked")
   *         example: "valorant,ranked"
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [OPEN, FULL, ENDED, CANCELLED]
   *         description: Filter by game status
   *       - in: query
   *         name: creatorId
   *         schema:
   *           type: string
   *         description: Filter by creator ID
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Search in title and description
   *       - in: query
   *         name: availableSlots
   *         schema:
   *           type: boolean
   *         description: Filter games with available slots
   *       - in: query
   *         name: minPlayers
   *         schema:
   *           type: integer
   *         description: Minimum player capacity
   *       - in: query
   *         name: maxPlayers
   *         schema:
   *           type: integer
   *         description: Maximum player capacity
   *       - in: query
   *         name: sortBy
   *         schema:
   *           type: string
   *           enum: [createdAt, startTime, endTime, popularity]
   *         description: Sort field
   *       - in: query
   *         name: sortOrder
   *         schema:
   *           type: string
   *           enum: [asc, desc]
   *         description: Sort order
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Page number
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 20
   *           maximum: 100
   *         description: Items per page
   *     responses:
   *       200:
   *         description: Games retrieved successfully
   */
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gameService = getGameService();
      const filters = {
        tags: req.query.tags ? (req.query.tags as string).split(',').map(t => t.trim()) : undefined,
        status: req.query.status as any,
        creatorId: req.query.creatorId as string,
        search: req.query.search as string,
        availableSlots: req.query.availableSlots === 'true',
        minPlayers: req.query.minPlayers ? parseInt(req.query.minPlayers as string) : undefined,
        maxPlayers: req.query.maxPlayers ? parseInt(req.query.maxPlayers as string) : undefined,
        startTimeFrom: req.query.startTimeFrom ? new Date(req.query.startTimeFrom as string) : undefined,
        startTimeTo: req.query.startTimeTo ? new Date(req.query.startTimeTo as string) : undefined,
        includeEnded: req.query.includeEnded === 'true',
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as any
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
   * @swagger
   * /api/v1/games/{id}:
   *   get:
   *     tags:
   *       - Games
   *     summary: Get game by ID
   *     description: Retrieve detailed information about a specific game
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Game ID
   *       - in: query
   *         name: details
   *         schema:
   *           type: boolean
   *           default: false
   *         description: Include participant details
   *     responses:
   *       200:
   *         description: Game retrieved successfully
   *       404:
   *         description: Game not found
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gameService = getGameService();
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
   * @swagger
   * /api/v1/games/my/created:
   *   get:
   *     tags:
   *       - Games
   *     summary: Get my created games
   *     description: Retrieve all games created by the authenticated user
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: tags
   *         schema:
   *           type: string
   *         description: Filter by tags (comma-separated)
   *         example: "valorant,ranked"
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [OPEN, FULL, ENDED, CANCELLED]
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 20
   *     responses:
   *       200:
   *         description: Created games retrieved successfully
   *       401:
   *         description: Unauthorized
   */
  async getMyCreatedGames(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gameService = getGameService();
      const userId = (req as any).user?.id;

      const filters = {
        tags: req.query.tags ? (req.query.tags as string).split(',').map(t => t.trim()) : undefined,
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
   * @swagger
   * /api/v1/games/my/joined:
   *   get:
   *     tags:
   *       - Games
   *     summary: Get my joined games
   *     description: Retrieve all games joined by the authenticated user
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: tags
   *         schema:
   *           type: string
   *         description: Filter by tags (comma-separated)
   *         example: "valorant,ranked"
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [OPEN, FULL, ENDED, CANCELLED]
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 20
   *     responses:
   *       200:
   *         description: Joined games retrieved successfully
   *       401:
   *         description: Unauthorized
   */
  async getMyJoinedGames(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gameService = getGameService();
      const userId = (req as any).user?.id;

      const filters = {
        tags: req.query.tags ? (req.query.tags as string).split(',').map(t => t.trim()) : undefined,
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
   * @swagger
   * /api/v1/games/{id}:
   *   patch:
   *     tags:
   *       - Games
   *     summary: Update game
   *     description: Update game details (creator only). Cannot update ended games.
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Game ID
   *     requestBody:
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *               description:
   *                 type: string
   *               maxPlayers:
   *                 type: integer
   *               endTime:
   *                 type: string
   *                 format: date-time
   *               image:
   *                 type: string
   *                 format: binary
   *     responses:
   *       200:
   *         description: Game updated successfully
   *       403:
   *         description: Forbidden - Only creator can update
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gameService = getGameService();
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
   * @swagger
   * /api/v1/games/{id}:
   *   delete:
   *     tags:
   *       - Games
   *     summary: Delete game
   *     description: Delete a game (creator only)
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Game deleted successfully
   *       403:
   *         description: Forbidden
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gameService = getGameService();
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
   * @swagger
   * /api/v1/games/{id}/join:
   *   post:
   *     tags:
   *       - Games
   *     summary: Join a game
   *     description: Join an open game as a participant
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Successfully joined the game
   *       400:
   *         description: Game is full or ended
   *       409:
   *         description: Conflict - race condition or already joined
   */
  async join(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gameService = getGameService();
      const gameId = req.params.id;
      const userId = (req as any).user?.id;

      const game = await gameService.joinGame(gameId, userId);

      res.status(200).json(
        apiResponse(true, 'Successfully joined the game', {
          game: {
            id: game._id,
            title: game.title,
            status: game.status,
            currentPlayers: game.currentPlayers,
            maxPlayers: game.maxPlayers,
            availableSlots: game.maxPlayers - game.currentPlayers
          }
        })
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/games/{id}/leave:
   *   post:
   *     tags:
   *       - Games
   *     summary: Leave a game
   *     description: Leave a game you have joined
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Successfully exited the game
   *       400:
   *         description: Not a participant
   */
  async leave(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gameService = getGameService();
      const gameId = req.params.id;
      const userId = (req as any).user?.id;

      const game = await gameService.leaveGame(gameId, userId);

      res.status(200).json(
        apiResponse(true, 'Successfully left the game', {
          game: {
            id: game._id,
            status: game.status,
            currentPlayers: game.currentPlayers,
            maxPlayers: game.maxPlayers,
            availableSlots: game.maxPlayers - game.currentPlayers
          }
        })
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/games/{id}/can-join:
   *   get:
   *     tags:
   *       - Games
   *     summary: Check if user can join game
   *     description: Check join eligibility before attempting to join
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Join eligibility checked
   */
  async canJoin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gameService = getGameService();
      const gameId = req.params.id;
      const userId = (req as any).user?.id;

      const eligibility = await gameService.checkJoinEligibility(gameId, userId);

      res.status(200).json(
        apiResponse(true, 'Join eligibility checked', eligibility)
      );
    } catch (error) {
      next(error);
    }
  }
}
