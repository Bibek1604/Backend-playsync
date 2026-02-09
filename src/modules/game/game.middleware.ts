/**
 * Game Module - Middleware
 * Custom middleware for game-specific validations
 */

import { Request, Response, NextFunction } from 'express';
import { GameRepository } from './game.repository';
import { AppError } from '../../Share/utils/AppError';
import { GameStatus } from './game.types';

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
      throw new AppError('Unauthorized', 401);
    }

    const game = await gameRepository.findById(gameId);

    if (!game) {
      throw new AppError('Game not found', 404);
    }

    if (game.creatorId.toString() !== userId) {
      throw new AppError('Forbidden: Only creator can perform this action', 403);
    }

    // Attach game to request for controller use
    (req as any).game = game;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Check if game can be edited (not ended)
 */
export const checkGameEditable = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const game = (req as any).game; // Set by checkGameOwnership

    if (!game) {
      const gameId = req.params.id;
      const foundGame = await gameRepository.findById(gameId);
      
      if (!foundGame) {
        throw new AppError('Game not found', 404);
      }
      
      if (foundGame.status === GameStatus.ENDED) {
        throw new AppError('Cannot modify ended game', 409);
      }
      
      (req as any).game = foundGame;
    } else {
      if (game.status === GameStatus.ENDED) {
        throw new AppError('Cannot modify ended game', 409);
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Check if game exists and is joinable
 */
export const checkGameJoinable = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const gameId = req.params.id;
    const game = await gameRepository.findById(gameId);

    if (!game) {
      throw new AppError('Game not found', 404);
    }

    if (game.status === GameStatus.ENDED) {
      throw new AppError('Cannot join ended game', 400);
    }

    if (game.status === GameStatus.FULL) {
      throw new AppError('Game is full', 400);
    }

    // Attach game to request
    (req as any).game = game;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Check if user is a participant of the game
 */
export const checkUserIsParticipant = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const gameId = req.params.id;
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    const isParticipant = await gameRepository.isUserParticipant(gameId, userId);

    if (!isParticipant) {
      throw new AppError('You are not a participant of this game', 400);
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Check if user is NOT already a participant
 */
export const checkUserNotParticipant = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const gameId = req.params.id;
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    const isParticipant = await gameRepository.isUserParticipant(gameId, userId);

    if (isParticipant) {
      throw new AppError('You have already joined this game', 400);
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication - sets user if token is valid but doesn't require it
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
      const { verifyToken } = await import('../../Share/config/jwt');
      try {
        const payload = verifyToken(token) as any;
        (req as any).user = payload;
      } catch (error) {
        // Invalid token, proceed without user
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
};
