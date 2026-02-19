/**
 * GameCapacityManager — handles player join/leave capacity tracking with
 * atomic-safe checks (MongoDB $inc with pre-condition).
 */

import mongoose, { Types } from 'mongoose';

export type CapacityCheckResult =
  | { allowed: true }
  | { allowed: false; reason: 'full' | 'already_joined' | 'game_not_found' | 'game_closed' };

export class GameCapacityManager {
  private gameModel = mongoose.model('Game');

  async canJoin(gameId: string, userId: string): Promise<CapacityCheckResult> {
    const game = await this.gameModel
      .findById(gameId)
      .select('status currentPlayers maxPlayers players')
      .lean();

    if (!game) return { allowed: false, reason: 'game_not_found' };
    if (game.status !== 'open') return { allowed: false, reason: 'game_closed' };
    if ((game.players as string[]).map(String).includes(userId)) {
      return { allowed: false, reason: 'already_joined' };
    }
    if (game.currentPlayers >= game.maxPlayers) {
      return { allowed: false, reason: 'full' };
    }
    return { allowed: true };
  }

  async atomicJoin(gameId: string, userId: string): Promise<boolean> {
    const result = await this.gameModel.updateOne(
      {
        _id: new Types.ObjectId(gameId),
        status: 'open',
        $expr: { $lt: ['$currentPlayers', '$maxPlayers'] },
        players: { $ne: new Types.ObjectId(userId) },
      },
      {
        $inc: { currentPlayers: 1 },
        $addToSet: { players: new Types.ObjectId(userId) },
      }
    );
    return result.modifiedCount === 1;
  }

  async atomicLeave(gameId: string, userId: string): Promise<boolean> {
    const result = await this.gameModel.updateOne(
      { _id: new Types.ObjectId(gameId), players: new Types.ObjectId(userId) },
      {
        $inc: { currentPlayers: -1 },
        $pull: { players: new Types.ObjectId(userId) },
      }
    );
    return result.modifiedCount === 1;
  }
}
