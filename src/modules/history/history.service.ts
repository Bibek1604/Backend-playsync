/**
 * User Game History - Service Layer
 * Business logic for game history operations
 */

import { GameHistoryRepository } from './history.repository';
import { GetGameHistoryQuery } from './history.dto';
import { GameHistoryResponse } from './history.types';
import AppError from '../../Share/utils/AppError';

export class GameHistoryService {
  private historyRepository: GameHistoryRepository;

  constructor() {
    this.historyRepository = new GameHistoryRepository();
  }

  /**
   * Get paginated game history for a user
   */
  async getMyGameHistory(
    userId: string,
    queryParams: GetGameHistoryQuery
  ): Promise<GameHistoryResponse> {
    // Validate userId
    if (!userId) {
      throw new AppError('User ID is required', 400, 'INVALID_USER_ID');
    }

    const { status, category, page = 1, limit = 10, sort = 'recent' } = queryParams;

    // Build filters
    const filters = {
      userId,
      status,
      category,
      page,
      limit,
      sort,
    };

    try {
      // Query database
      const { data, total } = await this.historyRepository.getUserGameHistory(filters);

      // Calculate pagination metadata
      const totalPages = Math.ceil(total / limit);
      const hasNext = page < totalPages;

      // Transform dates to ISO strings for JSON response
      const history = data.map((entry) => ({
        ...entry,
        myParticipation: {
          ...entry.myParticipation,
          joinedAt: entry.myParticipation.joinedAt,
          leftAt: entry.myParticipation.leftAt,
          participationStatus: entry.myParticipation.participationStatus,
          durationMinutes: entry.myParticipation.durationMinutes
            ? Math.round(entry.myParticipation.durationMinutes)
            : null,
        },
        gameInfo: {
          ...entry.gameInfo,
          endTime: entry.gameInfo.endTime,
        },
      }));

      return {
        history,
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
        'Failed to retrieve game history',
        500,
        'HISTORY_FETCH_ERROR',
        { originalError: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  }

  /**
   * Get user's participation statistics
   * Can be used for profile dashboard
   */
  async getMyParticipationStats(userId: string) {
    if (!userId) {
      throw new AppError('User ID is required', 400, 'INVALID_USER_ID');
    }

    try {
      const stats = await this.historyRepository.getUserParticipationStats(userId);
      return stats;
    } catch (error) {
      throw new AppError(
        'Failed to retrieve participation statistics',
        500,
        'STATS_FETCH_ERROR',
        { originalError: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  }

  /**
   * Get total game count for a user
   */
  async getMyGameCount(userId: string): Promise<number> {
    if (!userId) {
      throw new AppError('User ID is required', 400, 'INVALID_USER_ID');
    }

    try {
      return await this.historyRepository.getUserGameCount(userId);
    } catch (error) {
      throw new AppError(
        'Failed to retrieve game count',
        500,
        'COUNT_FETCH_ERROR',
        { originalError: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  }
}
