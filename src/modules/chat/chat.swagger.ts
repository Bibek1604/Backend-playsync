/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: Real-time chat functionality for game sessions
 */

/**
 * @swagger
 * /api/v1/games/{gameId}/chat:
 *   get:
 *     summary: Get chat history for a game
 *     tags: [Chat]
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
 *           default: 50
 *           minimum: 1
 *           maximum: 100
 *         description: Number of messages to retrieve
 *       - in: query
 *         name: before
 *         schema:
 *           type: string
 *         description: Message ID to fetch messages before (pagination)
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
 *                           gameId:
 *                             type: string
 *                           userId:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               fullName:
 *                                 type: string
 *                               profilePicture:
 *                                 type: string
 *                           message:
 *                             type: string
 *                           type:
 *                             type: string
 *                             enum: [USER, SYSTEM]
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                     hasMore:
 *                       type: boolean
 *                     nextCursor:
 *                       type: string
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - User is not a participant
 *       404:
 *         description: Game not found
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ChatMessage:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         gameId:
 *           type: string
 *         userId:
 *           type: string
 *         message:
 *           type: string
 *         type:
 *           type: string
 *           enum: [USER, SYSTEM]
 *         createdAt:
 *           type: string
 *           format: date-time
 */
