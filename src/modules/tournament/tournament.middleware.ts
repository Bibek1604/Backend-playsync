/**
 * Tournament Module - Chat Access Middleware
 * Protects tournament chat routes — user must be creator or paid participant
 */

import { Request, Response, NextFunction } from 'express';
import { TournamentService } from './tournament.service';
import AppError from '../../Share/utils/AppError';

const svc = new TournamentService();

export const requireTournamentChatAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const tournamentId = req.params.tournamentId || req.params.id;

    if (!userId) {
      return next(new AppError('Unauthorized', 401));
    }

    if (!tournamentId) {
      return next(new AppError('Tournament ID is required', 400));
    }

    const allowed = await svc.canAccessChat(tournamentId, userId);

    if (!allowed) {
      return next(
        new AppError(
          'Please complete payment to access this tournament chat.',
          403
        )
      );
    }

    next();
  } catch (err) {
    next(err);
  }
};
