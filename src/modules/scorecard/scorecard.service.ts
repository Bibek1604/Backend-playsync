/**
 * Scorecard Module - Service Layer
 * Business logic for scorecard and leaderboard operations
 */

import { ScorecardRepository } from './scorecard.repository';
import { GetLeaderboardQuery } from './scorecard.dto';
import { ScorecardData, LeaderboardResponse } from './scorecard.types';
import AppError from '../../Share/utils/AppError';

export class ScorecardService {
  private scorecardRepository: ScorecardRepository;

  constructor() {
    this.scorecardRepository = new ScorecardRepository();
  }

  /**
   * Get personal scorecard for authenticated user
   * Includes rank calculation
   */
  async getMyScorecard(userId: string): Promise<ScorecardData> {
    if (!userId) {
      throw new AppError('User ID is required', 400, 'INVALID_USER_ID');
    }

    try {
      // Get scorecard data
      const scorecard = await this.scorecardRepository.getUserScorecard(userId);

      // Get user's rank if they have points
      if (scorecard.totalPoints > 0) {
        const rank = await this.scorecardRepository.getUserRank(
          userId,
          scorecard.totalPoints
        );
        scorecard.rank = rank;
      }

      return scorecard;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        'Failed to retrieve scorecard',
        500,
        'SCORECARD_FETCH_ERROR',
        { originalError: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  }

  /**
   * Get leaderboard with top players
   * Paginated and sorted by total points
   */
  async getLeaderboard(queryParams: GetLeaderboardQuery): Promise<LeaderboardResponse> {
    const { limit = 50, page = 1, period = 'all' } = queryParams;

    try {
      const filters = {
        limit,
        page,
        period,
      };

      const { data, total } = await this.scorecardRepository.getLeaderboard(filters);

      // Calculate pagination metadata
      const totalPages = Math.ceil(total / limit);
      const hasNext = page < totalPages;

      return {
        leaderboard: data,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext,
        },
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        'Failed to retrieve leaderboard',
        500,
        'LEADERBOARD_FETCH_ERROR',
        { originalError: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  }

  /**
   * Get total count of active players
   * For statistics/analytics
   */
  async getTotalPlayersCount(): Promise<number> {
    try {
      return await this.scorecardRepository.getTotalPlayersCount();
    } catch (error) {
      throw new AppError(
        'Failed to retrieve player count',
        500,
        'PLAYER_COUNT_ERROR',
        { originalError: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  }
}
