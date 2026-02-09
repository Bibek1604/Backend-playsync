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
   *               - category
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
   *               category:
   *                 type: string
   *                 enum: [ONLINE, OFFLINE]
   *                 example: ONLINE
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
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: Game created successfully
   *                 data:
   *                   type: object
   *                   properties:
   *                     game:
   *                       $ref: '#/components/schemas/Game'
   *       400:
   *         description: Invalid input data
   *       401:
   *         description: Unauthorized - JWT token required
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
   * @swagger
   * /api/v1/games:
   *   get:
   *     tags:
   *       - Games
   *     summary: Get all games
   *     description: Retrieve all games with optional filtering and pagination
   *     parameters:
   *       - in: query
   *         name: category
   *         schema:
   *           type: string
   *           enum: [ONLINE, OFFLINE]
   *         description: Filter by game category
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [OPEN, FULL, ENDED]
   *         description: Filter by game status
   *       - in: query
   *         name: creatorId
   *         schema:
   *           type: string
   *         description: Filter by creator ID
   *       - in: query
   *         name: search
   *         schema:
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
   *         description: Game not founrch in title and description
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
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 message:
   *                   type: string
   *                 data:
   *                   type: object
   *                   properties:
   *                     games:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/Game'
   *                     pagination:
   *                       $ref: '#/components/schemas/Pagination'
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
    }@swagger
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
   *         name: category
   *         schema:
   *           type: string
   *           enum: [ONLINE, OFFLINE]
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [OPEN, FULL, ENDED]
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *       - in: query
   *         name: limit
   *         schema:
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
   *         name: category
   *         schema:
   *           type: string
   *           enum: [ONLINE, OFFLINE]
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [OPEN, FULL, ENDED]
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
   *         description: Unauthoriz
   *     responses:
   *       200:
   *         description: Created games retrieved successfully
   *       401:
   *         description: Unauthoriz

  /**
   * Get game by ID
   * @route GET /api/games/:id
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gameId = req.params.id;
      const includeDetails = req.query.details === 'true';

      const game = await gameService.getGameById(gameId, includeDetails);
@swagger
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
   * @swagger
   * /api/v1/games/{id}:
   *   delete:
   *     tags:
   *       - Games
   *     summary: Delete game
   *     description: Delete a game (creator only). Also deletes associated Cloudinary images.
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Game ID
   *     responses:
   *       200:
   *         description: Game deleted successfully
   *       403:
   *         description: Forbidden - Only creator can delete
   *       404:
   *         description: Game not foun
   *                 type: string
   *                 minLength: 3
   *                 maxLength: 255
   *               description:
   *                 type: string
   *                 maxLength: 2000
   *               maxPlayers:
   *                 type: integer
   *                 minimum: 1
   *                 maximum: 1000
   *               endTime:
   *                 type: string
   *                 format: date-time
   *               image:
   *                 type: string
   *                 format: binary
   *     responses:
   *       200:
   *         description: Game updated successfully
   *       400:
   *         description: Invalid input or cannot reduce maxPlayers below currentPlayers
   *       403:
   *         description: Forbidden - Only creator can update
   *       404:
   *         description: Game not found
   *       409:
   *         description: Cannot update ended game
        apiResponse(true, 'Game retrieved successfully', { game })
      );
    }@swagger
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
   *         description: Game ID
   *     responses:
   *       200:
   *         description: Successfully joined the game
   *         content:
   *           application/json:
   *             schema:
   *               type: object
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
   *         description: Game ID
   *     responses:
   *       200:
   *         description: Successfully left the game
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 message:
   *                   type: string
   *                 data:
   *                   type: object
   *                   properties:
   *                     gameId:
   *                       type: string
   *                     currentPlayers:
   *                       type: integer
   *                     status:
   *                       type: string
   *       400:
   *         description: Not a participant or game has ended
   *       404:
   *         description: Game not found
   *                   type: boolean
   *                 message:
   *                   type: string
   *                 data:
   *                   type: object
   *                   properties:
   *                     gameId:
   *                       type: string
   *                     currentPlayers:
   *                       type: integer
   *                     status:
   *                       type: string
   *                       enum: [OPEN, FULL, ENDED]
   *       400:
   *         description: Game is full, ended, or already joined
   *       404:
   *         description: Game not found
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
