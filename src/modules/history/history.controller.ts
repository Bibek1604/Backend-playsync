/**
 * User Game History - Controller Layer
 * HTTP request handlers for game history endpoints
 */

import { Request, Response } from 'express';
import { GameHistoryService } from './history.service';
import { GetGameHistoryQuery } from './history.dto';
import { apiResponse } from '../../Share/utils/apiResponse';

export class GameHistoryController {
  private historyService: GameHistoryService;

  constructor() {
    this.historyService = new GameHistoryService();
  }

  /**
   * GET /api/v1/history
   * Get authenticated user's game history
   */
  async getMyGameHistory(req: Request, res: Response): Promise<void> {
    const userId = (req as any).user?.id;
    const queryParams = req.query as unknown as GetGameHistoryQuery;

    const result = await this.historyService.getMyGameHistory(userId, queryParams);

    res.status(200).json(
      apiResponse(true, 'Game history retrieved successfully', result)
    );
  }

  /**
   * GET /api/v1/history/stats
   * Get authenticated user's participation statistics
   */
  async getMyParticipationStats(req: Request, res: Response): Promise<void> {
    const userId = (req as any).user?.id;

    const stats = await this.historyService.getMyParticipationStats(userId);

    res.status(200).json(
      apiResponse(true, 'Participation statistics retrieved successfully', stats)
    );
  }

  /**
   * GET /api/v1/history/count
   * Get total count of games user has participated in
   */
  async getMyGameCount(req: Request, res: Response): Promise<void> {
    const userId = (req as any).user?.id;

    const count = await this.historyService.getMyGameCount(userId);

    res.status(200).json(
      apiResponse(true, 'Game count retrieved successfully', { count })
    );
  }
}
