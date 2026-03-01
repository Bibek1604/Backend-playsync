/**
 * Scorecard Module - TypeScript Types
 * Type definitions for player scorecard and leaderboard
 */

export interface PointsBreakdown {
  pointsFromWins: number;
  pointsFromGames: number;
  pointsFromXP: number;
}

export interface ScorecardData {
  totalPoints: number; // For backward compatibility, mapped from XP
  xp: number;
  level: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
  rank?: number;
  breakdown: PointsBreakdown;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  fullName: string;
  avatar: string | null;
  xp: number;
  level: number;
  wins: number;
  totalGames: number;
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
