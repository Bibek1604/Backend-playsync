/**
 * @swagger
 * tags:
 *   name: Scorecard
 *   description: Player scorecard and points system
 */

/**
 * @swagger
 * /api/v1/scorecard:
 *   get:
 *     summary: Get authenticated user's personal scorecard with points and rank
 *     tags: [Scorecard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Scorecard retrieved successfully
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
 *                   example: Scorecard retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalPoints:
 *                       type: integer
 *                       example: 1240
 *                       description: Total points (joins × 10 + minutes × 2)
 *                     gamesJoined:
 *                       type: integer
 *                       example: 15
 *                       description: Number of games participated in
 *                     totalMinutesPlayed:
 *                       type: integer
 *                       example: 580
 *                       description: Total minutes across all games
 *                     rank:
 *                       type: integer
 *                       example: 42
 *                       description: Global ranking (1 = highest)
 *                     breakdown:
 *                       type: object
 *                       properties:
 *                         pointsFromJoins:
 *                           type: integer
 *                           example: 150
 *                           description: Points from joining games (joins × 10)
 *                         pointsFromTime:
 *                           type: integer
 *                           example: 1090
 *                           description: Points from playtime (minutes × 2)
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Scorecard:
 *       type: object
 *       properties:
 *         totalPoints:
 *           type: integer
 *           description: Total points earned
 *         gamesJoined:
 *           type: integer
 *           description: Number of games joined
 *         totalMinutesPlayed:
 *           type: integer
 *           description: Total minutes played
 *         rank:
 *           type: integer
 *           description: Global ranking position
 *         breakdown:
 *           type: object
 *           properties:
 *             pointsFromJoins:
 *               type: integer
 *             pointsFromTime:
 *               type: integer
 */
