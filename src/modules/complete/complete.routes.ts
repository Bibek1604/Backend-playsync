/**
 * Game Completion - Routes
 * API route definitions for manual game completion
 */

import { Router } from 'express';
import { CompleteGameController } from './complete.controller';
import { auth } from '../auth/auth.middleware';
import { validateDto } from '../../Share/utils/validateDto';
import { gameIdParamSchema } from '../game/game.dto';
import { checkGameOwnership, checkGameCompletable } from './complete.middleware';
import { asyncHandler } from '../../Share/utils/asyncHandler';

const router = Router();
const controller = new CompleteGameController();

/**
 * POST /api/v1/games/:id/complete
 * Manually complete a game (creator only)
 */
router.post(
  '/:id/complete',
  auth,
  validateDto(gameIdParamSchema),
  checkGameOwnership,
  checkGameCompletable,
  asyncHandler(controller.completeGame.bind(controller))
);

export default router;
