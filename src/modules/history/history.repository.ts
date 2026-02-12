/**
 * User Game History - Repository Layer
 * Database operations for game history queries
 */

import mongoose from 'mongoose';
import Game from '../game/game.model';
import { GameHistoryFilters, GameHistoryEntry } from './history.types';

export class GameHistoryRepository {
  /**
   * Get user's game history using aggregation pipeline
   * This is the most efficient way to query and transform the data
   */
  async getUserGameHistory(
    filters: GameHistoryFilters
  ): Promise<{ data: GameHistoryEntry[]; total: number }> {
    const { userId, status, category, page, limit, sort } = filters;

    // Build match conditions for the aggregation
    const matchConditions: any = {
      'participants.userId': new mongoose.Types.ObjectId(userId),
    };

    // Filter by game category if specified
    if (category) {
      matchConditions.category = category;
    }

    // Handle status filter - can be game status or participation status
    const gameStatuses = ['OPEN', 'FULL', 'ENDED', 'CANCELLED'];
    const participationStatuses = ['ACTIVE', 'LEFT'];

    if (status && gameStatuses.includes(status)) {
      matchConditions.status = status;
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Determine sort order
    let sortStage: any = { 'myParticipation.joinedAt': -1 }; // Default: recent
    if (sort === 'oldest') {
      sortStage = { 'myParticipation.joinedAt': 1 };
    } else if (sort === 'mostActive') {
      sortStage = { 'myParticipation.durationMinutes': -1 };
    }

    const pipeline: any[] = [
      // Stage 1: Match games where user is a participant
      {
        $match: matchConditions,
      },

      // Stage 2: Unwind participants array to work with individual participation
      {
        $unwind: '$participants',
      },

      // Stage 3: Match only the current user's participation
      {
        $match: {
          'participants.userId': new mongoose.Types.ObjectId(userId),
        },
      },

      // Stage 4: Filter by participation status if specified
      ...(status && participationStatuses.includes(status)
        ? [
            {
              $match: {
                'participants.status': status,
              },
            },
          ]
        : []),

      // Stage 5: Lookup creator information
      {
        $lookup: {
          from: 'users',
          localField: 'creatorId',
          foreignField: '_id',
          as: 'creator',
        },
      },

      // Stage 6: Unwind creator (should be single doc)
      {
        $unwind: {
          path: '$creator',
          preserveNullAndEmptyArrays: true,
        },
      },

      // Stage 7: Project (transform) the data to match response structure
      {
        $project: {
          gameId: '$_id',
          title: 1,
          category: 1,
          status: 1,
          myParticipation: {
            joinedAt: '$participants.joinedAt',
            leftAt: '$participants.leftAt',
            participationStatus: '$participants.status',
            durationMinutes: {
              $cond: {
                if: { $ifNull: ['$participants.leftAt', false] },
                then: {
                  $divide: [
                    {
                      $subtract: ['$participants.leftAt', '$participants.joinedAt'],
                    },
                    60000, // Convert milliseconds to minutes
                  ],
                },
                else: null,
              },
            },
          },
          gameInfo: {
            creatorName: { $ifNull: ['$creator.fullName', 'Unknown'] },
            maxPlayers: '$maxParticipants',
            currentPlayers: '$currentParticipants',
            endTime: '$date',
            imageUrl: '$image',
          },
        },
      },

      // Stage 8: Sort
      {
        $sort: sortStage,
      },

      // Stage 9: Facet for pagination (get both data and count in one query)
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          metadata: [{ $count: 'total' }],
        },
      },
    ];

    const result = await Game.aggregate(pipeline);

    const data = result[0]?.data || [];
    const total = result[0]?.metadata[0]?.total || 0;

    return { data, total };
  }

  /**
   * Get count of user's total games participated
   * Useful for profile statistics
   */
  async getUserGameCount(userId: string): Promise<number> {
    const count = await Game.countDocuments({
      'participants.userId': new mongoose.Types.ObjectId(userId),
    });
    return count;
  }

  /**
   * Get user's participation statistics
   * For dashboard/profile overview
   */
  async getUserParticipationStats(userId: string): Promise<{
    totalGames: number;
    activeGames: number;
    completedGames: number;
    leftEarly: number;
  }> {
    const stats = await Game.aggregate([
      {
        $match: {
          'participants.userId': new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $unwind: '$participants',
      },
      {
        $match: {
          'participants.userId': new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id: null,
          totalGames: { $sum: 1 },
          activeGames: {
            $sum: {
              $cond: [{ $eq: ['$participants.status', 'ACTIVE'] }, 1, 0],
            },
          },
          leftEarly: {
            $sum: {
              $cond: [{ $eq: ['$participants.status', 'LEFT'] }, 1, 0],
            },
          },
          completedGames: {
            $sum: {
              $cond: [{ $eq: ['$status', 'ENDED'] }, 1, 0],
            },
          },
        },
      },
    ]);

    if (stats.length === 0) {
      return {
        totalGames: 0,
        activeGames: 0,
        completedGames: 0,
        leftEarly: 0,
      };
    }

    return stats[0];
  }
}
