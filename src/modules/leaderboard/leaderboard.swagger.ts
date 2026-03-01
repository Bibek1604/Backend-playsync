/**
 * @swagger
 * tags:
 *   name: Leaderboard
 *   description: Public global leaderboard
 */

/**
 * @swagger
 * /api/v1/leaderboard:
 *   get:
 *     summary: Get global leaderboard with top players by points
 *     tags: [Leaderboard]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *           minimum: 1
 *           maximum: 200
 *         description: Items per page
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [all, monthly]
 *           default: all
 *         description: Time period filter
 *     responses:
 *       200:
 *         description: Leaderboard retrieved successfully
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
 *                   example: Leaderboard retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     leaderboard:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           rank:
 *                             type: integer
 *                             example: 1
 *                           userId:
 *                             type: string
 *                           fullName:
 *                             type: string
 *                             example: John Doe
 *                           profilePicture:
 *                             type: string
 *                             nullable: true
 *                           totalPoints:
 *                             type: integer
 *                             example: 5420
 *                           gamesJoined:
 *                             type: integer
 *                             example: 98
 *                           totalMinutes:
 *                             type: integer
 *                             example: 2100
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 50
 *                         total:
 *                           type: integer
 *                           example: 1247
 *                         totalPages:
 *                           type: integer
 *                           example: 25
 *                         hasNext:
 *                           type: boolean
 *                           example: true
 *       400:
 *         description: Invalid query parameters
 */

/**
 * @swagger
 * /api/v1/leaderboard/stats:
 *   get:
 *     summary: Get leaderboard statistics (total players)
 *     tags: [Leaderboard]
 *     responses:
 *       200:
 *         description: Leaderboard statistics retrieved successfully
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
 *                   example: Leaderboard statistics retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalPlayers:
 *                       type: integer
 *                       example: 1247
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     LeaderboardEntry:
 *       type: object
 *       properties:
 *         rank:
 *           type: integer
 *         userId:
 *           type: string
 *         fullName:
 *           type: string
 *         profilePicture:
 *           type: string
 *           nullable: true
 *         totalPoints:
 *           type: integer
 *         gamesJoined:
 *           type: integer
 *         totalMinutes:
 *           type: integer
 */
