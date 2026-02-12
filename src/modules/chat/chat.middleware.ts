/**
 * Chat Module - Middleware
 * Custom middleware for chat authorization
 */

import { Request, Response, NextFunction } from 'express';
import { GameRepository } from '../game/game.repository';
import AppError from '../../Share/utils/AppError';

const gameRepository = new GameRepository();

/**
 * Check if authenticated user is an active participant of the game
 * Must be used AFTER auth middleware
 */
export const checkUserIsActiveParticipant = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const gameId = req.params.gameId || req.params.id;
    const userId = (req as any).user?.id;
    
    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }
    
    if (!gameId) {
      throw new AppError('Game ID is required', 400);
    }
    
    // Get game
    const game = await gameRepository.findById(gameId);
    
    if (!game) {
      throw new AppError('Game not found', 404);
    }
    
    // Check if user is active participant
    const isActiveParticipant = game.participants.some(
      (p) => p.userId.toString() === userId && p.status === 'ACTIVE'
    );
    
    if (!isActiveParticipant) {
      throw new AppError('You must be an active participant to access this resource', 403);
    }
    
    // Attach game to request for potential reuse
    (req as any).game = game;
    
    next();
  } catch (error) {
    next(error);
  }
};
