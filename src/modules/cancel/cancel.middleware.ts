/**
 * Game Cancellation - Middleware
 * Validation middleware for game cancellation
 */

import { Request, Response, NextFunction } from 'express';
import { GameRepository } from '../game/game.repository';
import AppError from '../../Share/utils/AppError';
import { GameStatus } from '../game/game.types';

const gameRepository = new GameRepository();

/**
 * Check if the authenticated user is the game creator
 */
export const checkGameOwnership = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const gameId = req.params.id;
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    const game = await gameRepository.findById(gameId);

    if (!game) {
      throw new AppError('Game not found', 404, 'GAME_NOT_FOUND');
    }

    if (game.creatorId.toString() !== userId) {
      throw new AppError('Forbidden: Only the game creator can perform this action', 403, 'FORBIDDEN');
    }

    // Attach game to request for controller use
    (req as any).game = game;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Check if game can be cancelled (status must be OPEN or FULL)
 */
export const checkGameCancellable = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const game = (req as any).game; // Set by checkGameOwnership

    if (!game) {
      throw new AppError('Game not found in request', 500, 'INTERNAL_ERROR');
    }

    // Only OPEN or FULL games can be cancelled
    if (game.status !== GameStatus.OPEN && game.status !== GameStatus.FULL) {
      throw new AppError(
        `Cannot cancel game with status '${game.status}'. Only OPEN or FULL games can be cancelled.`,
        400,
        'INVALID_GAME_STATUS'
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};
