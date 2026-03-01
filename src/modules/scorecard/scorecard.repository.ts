/**
 * Scorecard Module - Repository Layer
 * Database operations for scorecard and leaderboard
 */

import { User } from '../auth/auth.model';
import { ScorecardData, LeaderboardEntry, LeaderboardFilters } from './scorecard.types';

export class ScorecardRepository {
  /**
   * Get personal scorecard for a single user from their User stats
   */
  async getUserScorecard(userId: string): Promise<ScorecardData> {
    const user = await User.findById(userId);

    if (!user) {
      return {
        totalPoints: 0,
        xp: 0,
        level: 1,
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
        breakdown: {
          pointsFromWins: 0,
          pointsFromGames: 0,
          pointsFromXP: 0,
        },
      };
    }

    return {
      totalPoints: user.xp, // XP is our primary metric for "points"
      xp: user.xp,
      level: user.level,
      gamesPlayed: user.totalGames,
      wins: user.wins,
      losses: user.losses,
      winRate: user.winRate,
      breakdown: {
        pointsFromWins: user.wins * 100, // Just a visual breakdown
        pointsFromGames: user.totalGames * 10,
        pointsFromXP: user.xp,
      },
    };
  }

  /**
   * Get user's global rank by comparing XP
   * Returns the rank position (1-based)
   */
  async getUserRank(userId: string, userXP: number): Promise<number> {
    // Count how many users have more XP than current user
    const usersAhead = await User.countDocuments({
      xp: { $gt: userXP }
    });

    // Rank is 1-based
    return usersAhead + 1;
  }

  /**
   * Get leaderboard with top players
   * Returns paginated list of players sorted by XP descending
   */
  async getLeaderboard(
    filters: LeaderboardFilters
  ): Promise<{ data: LeaderboardEntry[]; total: number }> {
    const { limit, page } = filters;
    const skip = (page - 1) * limit;

    const total = await User.countDocuments();
    const users = await User.find()
      .sort({ xp: -1, wins: -1 })
      .skip(skip)
      .limit(limit);

    const leaderboard: LeaderboardEntry[] = users.map((user, index) => ({
      rank: skip + index + 1,
      userId: (user._id as any).toString(),
      fullName: user.fullName,
      avatar: user.avatar || null,
      xp: user.xp,
      level: user.level,
      wins: user.wins,
      totalGames: user.totalGames,
    }));

    return { data: leaderboard, total };
  }

  /**
   * Get total count of active players
   */
  async getTotalPlayersCount(): Promise<number> {
    return await User.countDocuments();
  }
}
