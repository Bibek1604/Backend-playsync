/**
 * User Game History - Routes
 * API route definitions for game history endpoints
 */

import { Router } from 'express';
import { GameHistoryController } from './history.controller';
import { auth } from '../auth/auth.middleware';
import { validateDto } from '../../Share/utils/validateDto';
import { getGameHistoryQuerySchema } from './history.dto';
import { asyncHandler } from '../../Share/utils/asyncHandler';

const router = Router();
const controller = new GameHistoryController();

/**
 * @route   GET /api/v1/history
 * @desc    Get authenticated user's game participation history
 * @access  Private
 * @query   status, category, page, limit, sort
 */
router.get(
  '/',
  auth,
  validateDto(getGameHistoryQuerySchema),
  asyncHandler(controller.getMyGameHistory.bind(controller))
);

/**
 * @route   GET /api/v1/history/stats
 * @desc    Get authenticated user's participation statistics
 * @access  Private
 */
router.get(
  '/stats',
  auth,
  asyncHandler(controller.getMyParticipationStats.bind(controller))
);

/**
 * @route   GET /api/v1/history/count
 * @desc    Get total count of games user participated in
 * @access  Private
 */
router.get(
  '/count',
  auth,
  asyncHandler(controller.getMyGameCount.bind(controller))
);

export default router;
