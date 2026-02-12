/**
 * @swagger
 * components:
 *   schemas:
 *     Game:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Game unique identifier
 *           example: "507f1f77bcf86cd799439011"
 *         title:
 *           type: string
 *           minLength: 3
 *           maxLength: 255
 *           description: Game title
 *           example: "Friday Night Battle"
 *         description:
 *           type: string
 *           maxLength: 2000
 *           description: Game description
 *           example: "Weekly competitive match for all skill levels"
 *         category:
 *           type: string
 *           enum: [ONLINE, OFFLINE]
 *           description: Game category
 *           example: "ONLINE"
 *         imageUrl:
 *           type: string
 *           description: Cloudinary image URL
 *           example: "https://res.cloudinary.com/demo/image/upload/v1234567890/games/abc123.jpg"
 *         imagePublicId:
 *           type: string
 *           description: Cloudinary public ID for deletion
 *           example: "games/abc123"
 *         maxPlayers:
 *           type: integer
 *           minimum: 1
 *           maximum: 1000
 *           description: Maximum number of players
 *           example: 50
 *         currentPlayers:
 *           type: integer
 *           minimum: 0
 *           description: Current number of active players
 *           example: 23
 *         status:
 *           type: string
 *           enum: [OPEN, FULL, ENDED]
 *           description: Game status
 *           example: "OPEN"
 *         creatorId:
 *           type: string
 *           description: User ID of game creator
 *           example: "507f1f77bcf86cd799439012"
 *         participants:
 *           type: array
 *           description: List of game participants
 *           items:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: Participant user ID
 *               joinedAt:
 *                 type: string
 *                 format: date-time
 *                 description: When the user joined
 *               leftAt:
 *                 type: string
 *                 format: date-time
 *                 description: When the user left (null if active)
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, LEFT]
 *                 description: Participant status
 *         startTime:
 *           type: string
 *           format: date-time
 *           description: Game start time (auto-set on creation)
 *           example: "2026-02-09T18:00:00.000Z"
 *         endTime:
 *           type: string
 *           format: date-time
 *           description: Game end time (set by creator)
 *           example: "2026-02-10T22:00:00.000Z"
 *         endedAt:
 *           type: string
 *           format: date-time
 *           description: Actual end time (set by system)
 *           example: null
 *         metadata:
 *           type: object
 *           description: Additional game metadata
 *           example: {}
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Record creation timestamp
 *           example: "2026-02-09T18:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Record update timestamp
 *           example: "2026-02-09T18:15:00.000Z"
 *
 *     Pagination:
 *       type: object
 *       properties:
 *         page:
 *           type: integer
 *           description: Current page number
 *           example: 1
 *         limit:
 *           type: integer
 *           description: Items per page
 *           example: 20
 *         total:
 *           type: integer
 *           description: Total number of items
 *           example: 150
 *         totalPages:
 *           type: integer
 *           description: Total number of pages
 *           example: 8
 *
 *     GameCategory:
 *       type: string
 *       enum: [ONLINE, OFFLINE]
 *       description: Game category type
 *
 *     GameStatus:
 *       type: string
 *       enum: [OPEN, FULL, ENDED]
 *       description: |
 *         Game status:
 *         - OPEN: Game is accepting players
 *         - FULL: Game has reached maximum capacity
 *         - ENDED: Game has finished
 *
 *     ParticipantStatus:
 *       type: string
 *       enum: [ACTIVE, LEFT]
 *       description: |
 *         Participant status:
 *         - ACTIVE: Currently in the game
 *         - LEFT: Has left the game
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: Enter JWT token obtained from login
 */

// This file only contains Swagger documentation schemas
// No executable code needed
export {};
