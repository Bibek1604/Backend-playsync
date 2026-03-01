/**
 * @swagger
 * tags:
 *   name: History
 *   description: Game participation history and statistics
 */

/**
 * @swagger
 * /api/v1/history:
 *   get:
 *     summary: Get authenticated user's game participation history
 *     tags: [History]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [OPEN, FULL, ENDED, CANCELLED, ACTIVE, LEFT]
 *         description: Filter by game status or participation status
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [ONLINE, OFFLINE]
 *         description: Filter by game category
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 100
 *         description: Items per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [recent, oldest, mostActive]
 *           default: recent
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Game history retrieved successfully
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
 *                   example: Game history retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     games:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/GameHistoryEntry'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         hasNext:
 *                           type: boolean
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */

/**
 * @swagger
 * /api/v1/history/stats:
 *   get:
 *     summary: Get authenticated user's participation statistics
 *     tags: [History]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Participation statistics retrieved successfully
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
 *                   example: Participation statistics retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalGames:
 *                       type: integer
 *                       example: 25
 *                     activeGames:
 *                       type: integer
 *                       example: 3
 *                     completedGames:
 *                       type: integer
 *                       example: 20
 *                     gamesLeft:
 *                       type: integer
 *                       example: 2
 *                     totalMinutesPlayed:
 *                       type: integer
 *                       example: 1250
 *                     categoryBreakdown:
 *                       type: object
 *                       properties:
 *                         ONLINE:
 *                           type: integer
 *                         OFFLINE:
 *                           type: integer
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */

/**
 * @swagger
 * /api/v1/history/count:
 *   get:
 *     summary: Get total count of games user has participated in
 *     tags: [History]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Game count retrieved successfully
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
 *                   example: Game count retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 *                       example: 25
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     GameHistoryEntry:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         category:
 *           type: string
 *           enum: [ONLINE, OFFLINE]
 *         status:
 *           type: string
 *           enum: [OPEN, FULL, ENDED, CANCELLED]
 *         image:
 *           type: string
 *         scheduledAt:
 *           type: string
 *           format: date-time
 *         endedAt:
 *           type: string
 *           format: date-time
 *         participation:
 *           type: object
 *           properties:
 *             joinedAt:
 *               type: string
 *               format: date-time
 *             leftAt:
 *               type: string
 *               format: date-time
 *             status:
 *               type: string
 *               enum: [ACTIVE, LEFT]
 *             durationMinutes:
 *               type: integer
 */
