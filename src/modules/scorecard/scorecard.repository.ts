/**
 * Scorecard Module - Repository Layer
 * Database operations for scorecard and leaderboard
 */

import mongoose from 'mongoose';
import Game from '../game/game.model';
import { ScorecardData, LeaderboardEntry, LeaderboardFilters } from './scorecard.types';

export class ScorecardRepository {
  /**
   * Calculate personal scorecard for a single user
   * Uses aggregation to count games and sum minutes from Game.participants
   */
  async getUserScorecard(userId: string): Promise<ScorecardData> {
    const pipeline: any[] = [
      // Stage 1: Match games where user is a participant
      {
        $match: {
          'participants.userId': new mongoose.Types.ObjectId(userId),
        },
      },

      // Stage 2: Unwind participants array
      {
        $unwind: '$participants',
      },

      // Stage 3: Match only current user's participation
      {
        $match: {
          'participants.userId': new mongoose.Types.ObjectId(userId),
        },
      },

      // Stage 4: Calculate minutes for each participation
      {
        $addFields: {
          minutesPlayed: {
            $floor: {
              $divide: [
                {
                  $cond: {
                    // If user left (leftAt exists)
                    if: { $ifNull: ['$participants.leftAt', false] },
                    then: {
                      $subtract: ['$participants.leftAt', '$participants.joinedAt'],
                    },
                    // If still ACTIVE and game not ended
                    else: {
                      $cond: {
                        if: { $ne: ['$status', 'ENDED'] },
                        then: {
                          $subtract: [new Date(), '$participants.joinedAt'],
                        },
                        // If game ended but user didn't leave, use game endTime
                        else: {
                          $cond: {
                            if: { $ifNull: ['$endedAt', false] },
                            then: {
                              $subtract: ['$endedAt', '$participants.joinedAt'],
                            },
                            // Fallback to endTime
                            else: {
                              $subtract: ['$endTime', '$participants.joinedAt'],
                            },
                          },
                        },
                      },
                    },
                  },
                },
                60000, // Convert milliseconds to minutes
              ],
            },
          },
        },
      },

      // Stage 5: Group to calculate totals
      {
        $group: {
          _id: '$participants.userId',
          gamesJoined: { $sum: 1 },
          totalMinutesPlayed: { $sum: '$minutesPlayed' },
        },
      },

      // Stage 6: Calculate points
      {
        $project: {
          _id: 0,
          gamesJoined: 1,
          totalMinutesPlayed: 1,
          pointsFromJoins: { $multiply: ['$gamesJoined', 10] },
          pointsFromTime: { $multiply: ['$totalMinutesPlayed', 2] },
          totalPoints: {
            $add: [
              { $multiply: ['$gamesJoined', 10] },
              { $multiply: ['$totalMinutesPlayed', 2] },
            ],
          },
        },
      },
    ];

    const result = await Game.aggregate(pipeline);

    // If user never joined any games
    if (result.length === 0) {
      return {
        totalPoints: 0,
        gamesJoined: 0,
        totalMinutesPlayed: 0,
        breakdown: {
          pointsFromJoins: 0,
          pointsFromTime: 0,
        },
      };
    }

    const data = result[0];
    return {
      totalPoints: data.totalPoints,
      gamesJoined: data.gamesJoined,
      totalMinutesPlayed: data.totalMinutesPlayed,
      breakdown: {
        pointsFromJoins: data.pointsFromJoins,
        pointsFromTime: data.pointsFromTime,
      },
    };
  }

  /**
   * Get user's global rank by comparing total points
   * Returns the rank position (1-based)
   */
  async getUserRank(userId: string, userPoints: number): Promise<number> {
    // Count how many users have more points than current user
    const pipeline: any[] = [
      // Match all games with participants
      {
        $match: {
          'participants.0': { $exists: true },
        },
      },

      // Unwind participants
      {
        $unwind: '$participants',
      },

      // Calculate minutes per participation
      {
        $addFields: {
          minutesPlayed: {
            $floor: {
              $divide: [
                {
                  $cond: {
                    if: { $ifNull: ['$participants.leftAt', false] },
                    then: {
                      $subtract: ['$participants.leftAt', '$participants.joinedAt'],
                    },
                    else: {
                      $cond: {
                        if: { $ne: ['$status', 'ENDED'] },
                        then: {
                          $subtract: [new Date(), '$participants.joinedAt'],
                        },
                        else: {
                          $cond: {
                            if: { $ifNull: ['$endedAt', false] },
                            then: {
                              $subtract: ['$endedAt', '$participants.joinedAt'],
                            },
                            else: {
                              $subtract: ['$endTime', '$participants.joinedAt'],
                            },
                          },
                        },
                      },
                    },
                  },
                },
                60000,
              ],
            },
          },
        },
      },

      // Group by userId
      {
        $group: {
          _id: '$participants.userId',
          gamesJoined: { $sum: 1 },
          totalMinutes: { $sum: '$minutesPlayed' },
        },
      },

      // Calculate total points
      {
        $addFields: {
          totalPoints: {
            $add: [
              { $multiply: ['$gamesJoined', 10] },
              { $multiply: ['$totalMinutes', 2] },
            ],
          },
        },
      },

      // Filter users with more points
      {
        $match: {
          totalPoints: { $gt: userPoints },
        },
      },

      // Count them
      {
        $count: 'usersAhead',
      },
    ];

    const result = await Game.aggregate(pipeline);
    const usersAhead = result[0]?.usersAhead || 0;
    
    // Rank is 1-based (1st place, 2nd place, etc.)
    return usersAhead + 1;
  }

  /**
   * Get leaderboard with top players
   * Returns paginated list of players sorted by total points
   */
  async getLeaderboard(
    filters: LeaderboardFilters
  ): Promise<{ data: LeaderboardEntry[]; total: number }> {
    const { limit, page, period } = filters;
    const skip = (page - 1) * limit;

    // Build date filter for monthly period
    const dateFilter: any = {};
    if (period === 'monthly') {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      dateFilter['participants.joinedAt'] = { $gte: firstDayOfMonth };
    }

    const pipeline: any[] = [
      // Stage 1: Match games with participants (and optional date filter)
      {
        $match: {
          'participants.0': { $exists: true },
          ...dateFilter,
        },
      },

      // Stage 2: Unwind participants
      {
        $unwind: '$participants',
      },

      // Stage 3: Apply date filter to unwound participants if monthly
      ...(period === 'monthly'
        ? [
            {
              $match: dateFilter,
            },
          ]
        : []),

      // Stage 4: Calculate minutes per participation
      {
        $addFields: {
          minutesPlayed: {
            $floor: {
              $divide: [
                {
                  $cond: {
                    if: { $ifNull: ['$participants.leftAt', false] },
                    then: {
                      $subtract: ['$participants.leftAt', '$participants.joinedAt'],
                    },
                    else: {
                      $cond: {
                        if: { $ne: ['$status', 'ENDED'] },
                        then: {
                          $subtract: [new Date(), '$participants.joinedAt'],
                        },
                        else: {
                          $cond: {
                            if: { $ifNull: ['$endedAt', false] },
                            then: {
                              $subtract: ['$endedAt', '$participants.joinedAt'],
                            },
                            else: {
                              $subtract: ['$endTime', '$participants.joinedAt'],
                            },
                          },
                        },
                      },
                    },
                  },
                },
                60000,
              ],
            },
          },
        },
      },

      // Stage 5: Group by userId
      {
        $group: {
          _id: '$participants.userId',
          gamesJoined: { $sum: 1 },
          totalMinutes: { $sum: '$minutesPlayed' },
        },
      },

      // Stage 6: Calculate total points
      {
        $addFields: {
          totalPoints: {
            $add: [
              { $multiply: ['$gamesJoined', 10] },
              { $multiply: ['$totalMinutes', 2] },
            ],
          },
        },
      },

      // Stage 7: Sort by points descending
      {
        $sort: { totalPoints: -1 },
      },

      // Stage 8: Lookup user info
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },

      // Stage 9: Unwind user
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: false, // Skip if user not found
        },
      },

      // Stage 10: Project final structure
      {
        $project: {
          userId: '$_id',
          fullName: '$user.fullName',
          profilePicture: { $ifNull: ['$user.profilePicture', null] },
          totalPoints: 1,
          gamesJoined: 1,
          totalMinutes: 1,
        },
      },

      // Stage 11: Facet for pagination
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

    // Add rank to each entry (based on position)
    const leaderboard = data.map((entry: any, index: number) => ({
      rank: skip + index + 1,
      userId: entry.userId.toString(),
      fullName: entry.fullName,
      profilePicture: entry.profilePicture,
      totalPoints: entry.totalPoints,
      gamesJoined: entry.gamesJoined,
      totalMinutes: entry.totalMinutes,
    }));

    return { data: leaderboard, total };
  }

  /**
   * Get total count of players with at least one game
   * Useful for statistics
   */
  async getTotalPlayersCount(): Promise<number> {
    const pipeline = [
      {
        $match: {
          'participants.0': { $exists: true },
        },
      },
      {
        $unwind: '$participants',
      },
      {
        $group: {
          _id: '$participants.userId',
        },
      },
      {
        $count: 'totalPlayers',
      },
    ];

    const result = await Game.aggregate(pipeline);
    return result[0]?.totalPlayers || 0;
  }
}
