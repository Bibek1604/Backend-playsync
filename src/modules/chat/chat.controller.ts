/**
 * Chat Module - Controller Layer
 * HTTP request handlers for chat operations
 */

import { Request, Response, NextFunction } from 'express';
import { ChatService } from './chat.service';
import { GetChatHistoryQuery, GameIdParam } from './chat.dto';
import { apiResponse } from '../../Share/utils/apiResponse';

export class ChatController {
  private chatService: ChatService;
  
  constructor() {
    this.chatService = new ChatService();
  }
  
  /**
   * @swagger
   * /api/v1/games/{gameId}/chat:
   *   get:
   *     tags:
   *       - Chat
   *     summary: Get chat history for a game
   *     description: Retrieve chat messages for a game. Requires user to be active participant.
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: gameId
   *         required: true
   *         schema:
   *           type: string
   *         description: Game ID
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 50
   *         description: Number of messages to retrieve
   *       - in: query
   *         name: before
   *         schema:
   *           type: string
   *           format: date-time
   *         description: Cursor for pagination (ISO 8601 timestamp, get messages before this time)
   *     responses:
   *       200:
   *         description: Chat history retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: Chat history retrieved
   *                 data:
   *                   type: object
   *                   properties:
   *                     messages:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           _id:
   *                             type: string
   *                           user:
   *                             type: object
   *                             nullable: true
   *                             properties:
   *                               _id:
   *                                 type: string
   *                               username:
   *                                 type: string
   *                               fullName:
   *                                 type: string
   *                               profilePicture:
   *                                 type: string
   *                           content:
   *                             type: string
   *                           type:
   *                             type: string
   *                             enum: [text, system]
   *                           createdAt:
   *                             type: string
   *                             format: date-time
   *                     hasMore:
   *                       type: boolean
   *                       description: Whether there are more messages to load
   *                     nextCursor:
   *                       type: string
   *                       format: date-time
   *                       description: Cursor for next page (createdAt of last message)
   *       403:
   *         description: User is not an active participant
   *       404:
   *         description: Game not found
   */
  async getChatHistory(
    req: Request<GameIdParam, {}, {}, GetChatHistoryQuery>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { gameId } = req.params;
      const userId = (req as any).user?.id;
      const { limit, before } = req.query;
      
      if (!userId) {
        res.status(401).json(
          apiResponse(false, 'Unauthorized', null)
        );
        return;
      }
      
      const result = await this.chatService.getChatHistory(
        gameId,
        userId,
        limit || 50,
        before
      );
      
      res.status(200).json(
        apiResponse(true, 'Chat history retrieved', result)
      );
    } catch (error) {
      next(error);
    }
  }
}
