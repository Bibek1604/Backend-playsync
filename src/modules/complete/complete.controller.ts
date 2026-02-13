/**
 * Game Completion - Controller Layer
 * HTTP request handling for manual game completion
 */

import { Request, Response } from 'express';
import { CompleteGameService } from './complete.service';
import { apiResponse } from '../../Share/utils/apiResponse';

export class CompleteGameController {
  private service: CompleteGameService;

  constructor() {
    this.service = new CompleteGameService();
  }

  /**
   * @swagger
   * /api/v1/games/{id}/complete:
   *   post:
   *     tags:
   *       - Games
   *     summary: Manually complete a game
   *     description: Manually mark a game as completed (creator only). Can be used to end games early.
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           pattern: '^[0-9a-fA-F]{24}$'
   *         description: Game ID
   *         example: "507f1f77bcf86cd799439011"
   *     responses:
   *       200:
   *         description: Game completed successfully
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
   *                   example: "Game completed successfully"
   *                 data:
   *                   type: object
   *                   properties:
   *                     gameId:
   *                       type: string
   *                       example: "507f1f77bcf86cd799439011"
   *                     status:
   *                       type: string
   *                       enum: [ENDED]
   *                       example: "ENDED"
   *                     completedAt:
   *                       type: string
   *                       format: date-time
   *                       example: "2026-02-13T10:30:00.000Z"
   *       400:
   *         description: Invalid game status (already ended or completed)
   *       401:
   *         description: Unauthorized - JWT token required
   *       403:
   *         description: Forbidden - Only game creator can complete
   *       404:
   *         description: Game not found
   */
  async completeGame(req: Request, res: Response): Promise<void> {
    const gameId = req.params.id;
    const game = (req as any).game; // Set by checkGameOwnership middleware

    const result = await this.service.completeGame(gameId, game);

    res.status(200).json(
      apiResponse(
        result.success,
        result.message,
        result.data
      )
    );
  }
}
