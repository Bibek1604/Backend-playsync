/**
 * Scorecard Module - TypeScript Types
 * Type definitions for player scorecard and leaderboard
 */

export interface PointsBreakdown {
  pointsFromJoins: number;
  pointsFromTime: number;
}

export interface ScorecardData {
  totalPoints: number;
  gamesJoined: number;
  totalMinutesPlayed: number;
  rank?: number;
  breakdown: PointsBreakdown;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  fullName: string;
  profilePicture: string | null;
  totalPoints: number;
  gamesJoined: number;
  totalMinutes: number;
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
  };
}

export interface LeaderboardFilters {
  limit: number;
  page: number;
  period: 'all' | 'monthly';
}
