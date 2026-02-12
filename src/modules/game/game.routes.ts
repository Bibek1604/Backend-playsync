/**
 * Game Module - Routes
 * API route definitions for game operations
 */

import { Router } from 'express';
import { GameController } from './game.controller';
import { auth } from '../auth/auth.middleware';
import { validateDto } from '../../Share/utils/validateDto';
import {
  createGameSchema,
  updateGameSchema,
  getGamesQuerySchema,
  gameIdParamSchema
} from './game.dto';
import {
  checkGameOwnership,
  checkGameEditable,
  checkGameJoinable,
  checkUserIsParticipant,
  checkUserNotParticipant,
  optionalAuth
} from './game.middleware';
import { gameImageUpload } from './game.uploader';
import { asyncHandler } from '../../Share/utils/asyncHandler';

const router = Router();
const controller = new GameController();

// Create a new game (authenticated users only)
router.post(
  '/',
  auth,
  gameImageUpload.single('image'),
  validateDto(createGameSchema),
  asyncHandler(controller.create.bind(controller))
);

// Get all games (public - optional auth for personalization)
router.get(
  '/',
  optionalAuth,
  validateDto(getGamesQuerySchema),
  asyncHandler(controller.getAll.bind(controller))
);

// Get games created by authenticated user
router.get(
  '/my/created',
  auth,
  validateDto(getGamesQuerySchema),
  asyncHandler(controller.getMyCreatedGames.bind(controller))
);

// Get games joined by authenticated user
router.get(
  '/my/joined',
  auth,
  validateDto(getGamesQuerySchema),
  asyncHandler(controller.getMyJoinedGames.bind(controller))
);

// Get game by ID (public - optional auth)
router.get(
  '/:id',
  optionalAuth,
  validateDto(gameIdParamSchema),
  asyncHandler(controller.getById.bind(controller))
);

// Join a game
router.post(
  '/:id/join',
  auth,
  validateDto(gameIdParamSchema),
  checkGameJoinable,
  checkUserNotParticipant,
  asyncHandler(controller.join.bind(controller))
);

// Leave a game
router.post(
  '/:id/leave',
  auth,
  validateDto(gameIdParamSchema),
  checkUserIsParticipant,
  asyncHandler(controller.leave.bind(controller))
);

// Update game (creator only)
router.patch(
  '/:id',
  auth,
  gameImageUpload.single('image'),
  validateDto(gameIdParamSchema),
  validateDto(updateGameSchema),
  checkGameOwnership,
  checkGameEditable,
  asyncHandler(controller.update.bind(controller))
);

// Delete game (creator only)
router.delete(
  '/:id',
  auth,
  validateDto(gameIdParamSchema),
  checkGameOwnership,
  asyncHandler(controller.delete.bind(controller))
);

export default router;
