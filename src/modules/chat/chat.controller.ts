/**
 * Chat Module - Controller Layer
 * HTTP request handlers for chat operations
 */

import { Request, Response, NextFunction } from 'express';
import { ChatService } from './chat.service';
import { GetChatHistoryQuery, GameIdParam, SendMessageBody } from './chat.dto';
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
   *                             example: 64abc123def456789abcdef0
   *                           senderId:
   *                             type: string
   *                             description: User ID of the sender
   *                             example: 64abc123def456789abcdef1
   *                           senderName:
   *                             type: string
   *                             description: Display name of the sender
   *                             example: John Doe
   *                           senderAvatar:
   *                             type: string
   *                             nullable: true
   *                             description: Avatar URL of the sender
   *                             example: https://example.com/avatar.jpg
   *                           text:
   *                             type: string
   *                             description: Message content
   *                             example: Ready to play!
   *                           type:
   *                             type: string
   *                             enum: [text, system]
   *                             example: text
   *                           createdAt:
   *                             type: string
   *                             format: date-time
   *                             example: 2026-03-03T18:00:00.000Z
   *                     hasMore:
   *                       type: boolean
   *                       description: Whether there are more messages to load
   *                       example: false
   *                     nextCursor:
   *                       type: string
   *                       format: date-time
   *                       description: Cursor for next page (createdAt of last message)
   *                       example: 2026-03-03T17:00:00.000Z
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

  /**
   * @swagger
   * /api/v1/games/{gameId}/chat:
   *   post:
   *     tags:
   *       - Chat
   *     summary: Send a chat message via REST (fallback)
   *     description: Send a text message to the game chat room. Requires user to be active participant.
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: gameId
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               content:
   *                 type: string
   *                 example: Ready to play!
   *     responses:
   *       201:
   *         description: Message sent successfully
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
   *                   example: Message sent
   *                 data:
   *                   type: object
   *                   description: The saved ChatMessageDTO returned by the server
   *                   properties:
   *                     _id:
   *                       type: string
   *                       example: 64abc123def456789abcdef0
   *                     senderId:
   *                       type: string
   *                       description: User ID of the sender
   *                       example: 64abc123def456789abcdef1
   *                     senderName:
   *                       type: string
   *                       description: Display name of the sender
   *                       example: John Doe
   *                     senderAvatar:
   *                       type: string
   *                       nullable: true
   *                       description: Avatar URL of the sender
   *                     text:
   *                       type: string
   *                       description: Saved message content
   *                       example: Ready to play!
   *                     type:
   *                       type: string
   *                       enum: [text, system]
   *                       example: text
   *                     createdAt:
   *                       type: string
   *                       format: date-time
   *                       example: 2026-03-03T18:00:00.000Z
   *       400:
   *         description: Validation error (empty content / content too long)
   *       401:
   *         description: Not authenticated
   *       403:
   *         description: User is not an active participant
   *       404:
   *         description: Game not found
   */
  async sendMessage(
    req: Request<GameIdParam, {}, SendMessageBody>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { gameId } = req.params;
      const userId = (req as any).user?.id;
      const { content } = req.body;

      if (!userId) {
        res.status(401).json(apiResponse(false, 'Unauthorized', null));
        return;
      }

      // Create message in database
      const message = await this.chatService.createTextMessage(gameId, userId, content);

      // Get populated message for response and broadcasting
      const messageDTO = await this.chatService.getMessageById(message._id.toString());

      if (!messageDTO) {
        res.status(500).json(apiResponse(false, 'Failed to process message', null));
        return;
      }

      // Broadcast to other participants who are connected via socket
      try {
        const { getSocketServer } = await import('../../websocket/socket.server');
        const io = getSocketServer();
        io.to(`game:${gameId}`).emit('chat:message', messageDTO);
      } catch (e) {
        // Log but don't fail the request if broadcasting fails
        console.error('[CHAT REST] Broadcast failed:', e);
      }

      res.status(201).json(apiResponse(true, 'Message sent', messageDTO));
    } catch (error) {
      next(error);
    }
  }
}
