import mongoose, { PipelineStage } from 'mongoose';

export interface GameAnalytics {
  totalGames: number;
  openGames: number;
  ongoingGames: number;
  completedGames: number;
  avgPlayersPerGame: number;
  mostPopularSports: Array<{ sport: string; count: number }>;
  avgGameDurationMinutes: number;
  gamesCreatedLast7Days: number;
}

export class GameAnalyticsRepository {
  private get gameModel() {
    return mongoose.model('Game');
  }

  async getOverview(): Promise<GameAnalytics> {
    const [statusStats, sportStats, durationStats, recentCount] = await Promise.all([
      this.getStatusBreakdown(),
      this.getTopSports(5),
      this.getAvgDuration(),
      this.getRecentCount(7),
    ]);

    const total = statusStats.total ?? 0;
    return {
      totalGames: total,
      openGames: statusStats.open ?? 0,
      ongoingGames: statusStats.ongoing ?? 0,
      completedGames: statusStats.completed ?? 0,
      avgPlayersPerGame: statusStats.avgPlayers ?? 0,
      mostPopularSports: sportStats,
      avgGameDurationMinutes: durationStats,
      gamesCreatedLast7Days: recentCount,
    };
  }

  private async getStatusBreakdown() {
    const pipeline: PipelineStage[] = [
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          open: { $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] } },
          ongoing: { $sum: { $cond: [{ $eq: ['$status', 'ongoing'] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          avgPlayers: { $avg: '$currentPlayers' },
        },
      },
    ];
    const [result] = await this.gameModel.aggregate(pipeline);
    return result ?? {};
  }

  private async getTopSports(limit: number) {
    return this.gameModel.aggregate([
      { $group: { _id: '$sportType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
      { $project: { sport: '$_id', count: 1, _id: 0 } },
    ]);
  }

  private async getAvgDuration(): Promise<number> {
    const [result] = await this.gameModel.aggregate([
      { $match: { status: 'completed', startedAt: { $exists: true }, endedAt: { $exists: true } } },
      {
        $project: {
          durationMin: {
            $divide: [{ $subtract: ['$endedAt', '$startedAt'] }, 60000],
          },
        },
      },
      { $group: { _id: null, avg: { $avg: '$durationMin' } } },
    ]);
    return Math.round(result?.avg ?? 0);
  }

  private async getRecentCount(days: number): Promise<number> {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return this.gameModel.countDocuments({ createdAt: { $gte: since } });
  }
}

export const gameAnalyticsRepo = new GameAnalyticsRepository();
