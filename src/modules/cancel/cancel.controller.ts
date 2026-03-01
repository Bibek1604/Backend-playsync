/**
 * Game Cancellation - Controller Layer
 * HTTP request handling for game cancellation
 */

import { Request, Response } from 'express';
import { CancelGameService } from './cancel.service';
import { apiResponse } from '../../Share/utils/apiResponse';

export class CancelGameController {
  private service: CancelGameService;

  constructor() {
    this.service = new CancelGameService();
  }

  /**
   * @swagger
   * /api/v1/games/{id}/cancel:
   *   post:
   *     tags:
   *       - Games
   *     summary: Cancel a game
   *     description: Cancel a game (creator only). Only games with status OPEN or FULL can be cancelled.
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
   *         description: Game cancelled successfully
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
   *                   example: "Game cancelled successfully"
   *                 data:
   *                   type: object
   *                   properties:
   *                     gameId:
   *                       type: string
   *                       example: "507f1f77bcf86cd799439011"
   *                     status:
   *                       type: string
   *                       enum: [CANCELLED]
   *                       example: "CANCELLED"
   *                     cancelledAt:
   *                       type: string
   *                       format: date-time
   *                       example: "2026-02-13T10:30:00.000Z"
   *       400:
   *         description: Invalid game status (cannot cancel ended or already cancelled games)
   *       401:
   *         description: Unauthorized - JWT token required
   *       403:
   *         description: Forbidden - Only game creator can cancel
   *       404:
   *         description: Game not found
   */
  async cancelGame(req: Request, res: Response): Promise<void> {
    const gameId = req.params.id;
    const game = (req as any).game; // Set by checkGameOwnership middleware

    const result = await this.service.cancelGame(gameId, game);

    res.status(200).json(
      apiResponse(
        result.success,
        result.message,
        result.data
      )
    );
  }
}
