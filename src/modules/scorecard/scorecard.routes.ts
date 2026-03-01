/**
 * Scorecard Module - Routes
 * API route definitions for scorecard and leaderboard endpoints
 */

import { Router } from 'express';
import { ScorecardController } from './scorecard.controller';
import { auth } from '../auth/auth.middleware';
import { validateDto } from '../../Share/utils/validateDto';
import { getLeaderboardQuerySchema } from './scorecard.dto';
import { asyncHandler } from '../../Share/utils/asyncHandler';

const router = Router();
const controller = new ScorecardController();

/**
 * @route   GET /api/v1/scorecard
 * @desc    Get authenticated user's personal scorecard with points and rank
 * @access  Private
 */
router.get(
  '/',
  auth,
  asyncHandler(controller.getMyScorecard.bind(controller))
);

export default router;
