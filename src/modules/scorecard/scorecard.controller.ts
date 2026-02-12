/**
 * Scorecard Module - Controller Layer
 * HTTP request handlers for scorecard and leaderboard endpoints
 */

import { Request, Response } from 'express';
import { ScorecardService } from './scorecard.service';
import { GetLeaderboardQuery } from './scorecard.dto';
import { apiResponse } from '../../Share/utils/apiResponse';

export class ScorecardController {
  private scorecardService: ScorecardService;

  constructor() {
    this.scorecardService = new ScorecardService();
  }

  /**
   * GET /api/v1/scorecard
   * Get authenticated user's personal scorecard
   */
  async getMyScorecard(req: Request, res: Response): Promise<void> {
    const userId = (req as any).user?.id;

    const scorecard = await this.scorecardService.getMyScorecard(userId);

    res.status(200).json(
      apiResponse(true, 'Scorecard retrieved successfully', scorecard)
    );
  }

  /**
   * GET /api/v1/leaderboard
   * Get global leaderboard with top players
   */
  async getLeaderboard(req: Request, res: Response): Promise<void> {
    const queryParams = req.query as unknown as GetLeaderboardQuery;

    const result = await this.scorecardService.getLeaderboard(queryParams);

    res.status(200).json(
      apiResponse(true, 'Leaderboard retrieved successfully', result)
    );
  }

  /**
   * GET /api/v1/leaderboard/stats
   * Get leaderboard statistics (total players, etc.)
   */
  async getLeaderboardStats(req: Request, res: Response): Promise<void> {
    const totalPlayers = await this.scorecardService.getTotalPlayersCount();

    res.status(200).json(
      apiResponse(true, 'Leaderboard statistics retrieved successfully', {
        totalPlayers,
      })
    );
  }
}
