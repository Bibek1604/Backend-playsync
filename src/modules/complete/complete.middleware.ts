/**
 * Game Completion - Middleware
 * Validation middleware for manual game completion
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
 * Check if game can be completed (status must not be ENDED)
 */
export const checkGameCompletable = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const game = (req as any).game; // Set by checkGameOwnership

    if (!game) {
      throw new AppError('Game not found in request', 500, 'INTERNAL_ERROR');
    }

    // Cannot complete already ended games
    if (game.status === GameStatus.ENDED) {
      throw new AppError(
        'Cannot complete game that is already ended',
        400,
        'INVALID_GAME_STATUS'
      );
    }

    // Check if already completed
    if (game.completedAt) {
      throw new AppError(
        'Game has already been completed',
        400,
        'ALREADY_COMPLETED'
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};
