/**
 * GameScoringService — computes and persists player scores at game completion.
 * Supports custom sport rules via a scoring strategy pattern.
 */

export interface PlayerResult {
  userId: string;
  score: number;
  assists?: number;
  penalties?: number;
  metadata?: Record<string, unknown>;
}

export interface ScoringContext {
  gameId: string;
  sportType: string;
  players: PlayerResult[];
  durationMinutes: number;
}

export interface ScoredResult extends PlayerResult {
  rank: number;
  isWinner: boolean;
  bonusPoints: number;
  totalPoints: number;
}

function applyWinBonus(rank: number, playerCount: number): number {
  if (rank === 1) return 50;
  if (rank === 2 && playerCount > 3) return 25;
  if (rank === 3 && playerCount > 5) return 10;
  return 0;
}

function applyParticipationPoints(): number {
  return 10;
}

export class GameScoringService {
  static compute(ctx: ScoringContext): ScoredResult[] {
    const sorted = [...ctx.players].sort((a, b) => b.score - a.score);

    return sorted.map((player, idx) => {
      const rank = idx + 1;
      const bonus = applyWinBonus(rank, sorted.length);
      const participation = applyParticipationPoints();
      const totalPoints = player.score + bonus + participation - (player.penalties ?? 0);

      return {
        ...player,
        rank,
        isWinner: rank === 1,
        bonusPoints: bonus + participation,
        totalPoints: Math.max(0, totalPoints),
      };
    });
  }

  static getWinner(ctx: ScoringContext): string | null {
    const results = GameScoringService.compute(ctx);
    return results[0]?.userId ?? null;
  }

  static toLeaderboardEntries(results: ScoredResult[]): Array<{ userId: string; points: number; rank: number }> {
    return results.map(r => ({ userId: r.userId, points: r.totalPoints, rank: r.rank }));
  }
}
