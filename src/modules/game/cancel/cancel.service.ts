/**
 * Game Cancellation - Service Layer
 * Business logic for game cancellation
 */

import { GameRepository } from '../game.repository';
import { NotificationService } from '../../notification/notification.service';
import { NotificationType } from '../../notification/notification.types';
import { IGameDocument } from '../game.model';
import { GameStatus, ParticipantStatus } from '../game.types';
import { getSocketServer } from '../../../websocket/socket.server';
import AppError from '../../../Share/utils/AppError';

export class CancelGameService {
  private gameRepository: GameRepository;
  private notificationService: NotificationService;

  constructor() {
    this.gameRepository = new GameRepository();
    this.notificationService = new NotificationService();
  }

  /**
   * Cancel a game
   */
  async cancelGame(gameId: string, game: IGameDocument): Promise<{
    success: boolean;
    message: string;
    data: {
      gameId: string;
      status: GameStatus;
      cancelledAt: Date;
    };
  }> {
    // Update game status to CANCELLED
    game.status = GameStatus.CANCELLED;
    game.cancelledAt = new Date();
    await game.save();

    // Get all active participants (excluding creator)
    const activeParticipants = game.participants.filter(
      (p) => p.status === ParticipantStatus.ACTIVE && p.userId.toString() !== game.creatorId.toString()
    );

    // Notify all active participants
    const notificationPromises = activeParticipants.map((participant) =>
      this.notificationService.createNotification(
        participant.userId.toString(),
        NotificationType.GAME_CANCELLED,
        'Game Cancelled',
        `The game "${game.title}" has been cancelled by the creator.`,
        {
          gameId: gameId,
          gameTitle: game.title,
          cancelledAt: game.cancelledAt
        }
      )
    );

    // Execute all notifications in parallel
    await Promise.allSettled(notificationPromises);

    // Emit Socket.IO event to game room
    try {
      const io = getSocketServer();
      io.to(`game:${gameId}`).emit('game:cancelled', {
        gameId,
        status: GameStatus.CANCELLED,
        cancelledAt: game.cancelledAt,
        message: `Game "${game.title}" has been cancelled`,
        timestamp: new Date()
      });

      // Also emit to discovery room to update listings
      io.to('discovery').emit('game:updated', {
        gameId,
        status: GameStatus.CANCELLED,
        cancelledAt: game.cancelledAt
      });
    } catch (error) {
      console.error('Failed to emit game cancellation via Socket.IO:', error);
    }

    return {
      success: true,
      message: 'Game cancelled successfully',
      data: {
        gameId,
        status: GameStatus.CANCELLED,
        cancelledAt: game.cancelledAt
      }
    };
  }
}
