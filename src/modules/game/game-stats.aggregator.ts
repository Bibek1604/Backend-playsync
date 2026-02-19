import mongoose from 'mongoose';

export interface GameStatsAggregation {
  totalGames: number;
  completedGames: number;
  cancelledGames: number;
  averagePlayersPerGame: number;
  mostPopularSport: string | null;
  gamesThisWeek: number;
  gamesThisMonth: number;
}

export class GameStatsAggregator {
  private static gameModel = () => mongoose.model('Game');

  static async getGlobalStats(): Promise<GameStatsAggregation> {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [summary, sportAgg, weeklyCount, monthlyCount] = await Promise.all([
      GameStatsAggregator.gameModel().aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
            cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
            avgPlayers: { $avg: '$currentPlayers' },
          },
        },
      ]),
      GameStatsAggregator.gameModel().aggregate([
        { $group: { _id: '$sportType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 },
      ]),
      GameStatsAggregator.gameModel().countDocuments({ createdAt: { $gte: weekAgo } }),
      GameStatsAggregator.gameModel().countDocuments({ createdAt: { $gte: monthAgo } }),
    ]);

    const s = summary[0] ?? {};
    return {
      totalGames: s.total ?? 0,
      completedGames: s.completed ?? 0,
      cancelledGames: s.cancelled ?? 0,
      averagePlayersPerGame: Math.round(s.avgPlayers ?? 0),
      mostPopularSport: sportAgg[0]?._id ?? null,
      gamesThisWeek: weeklyCount,
      gamesThisMonth: monthlyCount,
    };
  }

  static async getPlayerStats(userId: string): Promise<{
    hosted: number;
    joined: number;
    won: number;
    winRate: number;
  }> {
    const uid = new mongoose.Types.ObjectId(userId);
    const [hosted, joined] = await Promise.all([
      GameStatsAggregator.gameModel().countDocuments({ createdBy: uid }),
      GameStatsAggregator.gameModel().countDocuments({ players: uid }),
    ]);
    // won is derived from scorecard; placeholder
    const won = 0;
    return { hosted, joined, won, winRate: joined > 0 ? Math.round((won / joined) * 100) : 0 };
  }
}
