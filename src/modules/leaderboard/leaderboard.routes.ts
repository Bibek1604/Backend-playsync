/**
 * Leaderboard Routes
 * Public API routes for global leaderboard
 */

import { Router } from 'express';
import { ScorecardController } from '../scorecard/scorecard.controller';
import { validateDto } from '../../Share/utils/validateDto';
import { getLeaderboardQuerySchema } from '../scorecard/scorecard.dto';
import { asyncHandler } from '../../Share/utils/asyncHandler';

const router = Router();
const controller = new ScorecardController();

/**
 * @route   GET /api/v1/leaderboard
 * @desc    Get global leaderboard with top players by points
 * @access  Public
 * @query   limit, page, period
 */
router.get(
  '/',
  validateDto(getLeaderboardQuerySchema),
  asyncHandler(controller.getLeaderboard.bind(controller))
);

/**
 * @route   GET /api/v1/leaderboard/stats
 * @desc    Get leaderboard statistics (total players)
 * @access  Public
 */
router.get(
  '/stats',
  asyncHandler(controller.getLeaderboardStats.bind(controller))
);

export default router;
