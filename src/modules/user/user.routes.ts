import { Router } from 'express';
import { UserController } from './user.controller';
import { auth } from '../auth/auth.middleware';
import { asyncHandler } from '../../Share/utils/asyncHandler';

const router = Router();
const controller = new UserController();

// Leaderboard (public)
router.get('/leaderboard', asyncHandler(controller.getLeaderboard.bind(controller)));

// My profile
router.get('/me', auth, asyncHandler(controller.getMyProfile.bind(controller)));
router.patch('/profile', auth, asyncHandler(controller.updateMyProfile.bind(controller)));

// User profile by ID
router.get('/:id', asyncHandler(controller.getProfile.bind(controller)));
router.get('/:id/stats', asyncHandler(controller.getProfile.bind(controller))); // Same as profile for now as it includes stats

export default router;
