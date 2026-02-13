/**
 * Game Cancellation - Routes
 * API route definitions for game cancellation
 */

import { Router } from 'express';
import { CancelGameController } from './cancel.controller';
import { auth } from '../../auth/auth.middleware';
import { validateDto } from '../../../Share/utils/validateDto';
import { gameIdParamSchema } from '../game.dto';
import { checkGameOwnership, checkGameCancellable } from './cancel.middleware';
import { asyncHandler } from '../../../Share/utils/asyncHandler';

const router = Router();
const controller = new CancelGameController();

/**
 * POST /api/v1/games/:id/cancel
 * Cancel a game (creator only)
 */
router.post(
  '/:id/cancel',
  auth,
  validateDto(gameIdParamSchema),
  checkGameOwnership,
  checkGameCancellable,
  asyncHandler(controller.cancelGame.bind(controller))
);

export default router;
