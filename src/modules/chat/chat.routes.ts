/**
 * Chat Module - Routes
 * API route definitions for chat operations
 */

import { Router } from 'express';
import { ChatController } from './chat.controller';
import { auth } from '../auth/auth.middleware';
import { validateDto } from '../../Share/utils/validateDto';
import { getChatHistoryQuerySchema, gameIdParamSchema, sendMessageSchema } from './chat.dto';
import { checkUserIsActiveParticipant } from './chat.middleware';
import { asyncHandler } from '../../Share/utils/asyncHandler';

const router = Router({ mergeParams: true }); // mergeParams to access parent route params
const controller = new ChatController();

/**
 * GET /api/v1/games/:gameId/chat
 * Get chat history for a game
 */
router.get(
  '/',
  auth,
  validateDto(gameIdParamSchema),
  validateDto(getChatHistoryQuerySchema),
  checkUserIsActiveParticipant,
  asyncHandler(controller.getChatHistory.bind(controller))
);

/**
 * POST /api/v1/games/:gameId/chat
 * Send a chat message (REST fallback)
 */
router.post(
  '/',
  auth,
  validateDto(gameIdParamSchema),
  validateDto(sendMessageSchema),
  checkUserIsActiveParticipant,
  asyncHandler(controller.sendMessage.bind(controller))
);

export default router;
