/**
 * Game Completion - Service Layer
 * Business logic for manual game completion
 */

import { GameRepository } from '../game/game.repository';
import { NotificationService } from '../notification/notification.service';
import { NotificationType } from '../notification/notification.types';
import { IGameDocument } from '../game/game.model';
import { GameStatus, ParticipantStatus } from '../game/game.types';
import { getSocketServer } from '../../websocket/socket.server';
import AppError from '../../Share/utils/AppError';

export class CompleteGameService {
  private gameRepository: GameRepository;
  private notificationService: NotificationService;

  constructor() {
    this.gameRepository = new GameRepository();
    this.notificationService = new NotificationService();
  }

  /**
   * Manually complete a game
   */
  async completeGame(gameId: string, game: IGameDocument): Promise<{
    success: boolean;
    message: string;
    data: {
      gameId: string;
      status: GameStatus;
      completedAt: Date;
    };
  }> {
    // Update game status to ENDED (representing completion)
    game.status = GameStatus.ENDED;
    game.completedAt = new Date();
    game.endedAt = new Date(); // Also set endedAt for consistency
    await game.save();

    // Get all active participants (excluding creator)
    const activeParticipants = game.participants.filter(
      (p) => p.status === ParticipantStatus.ACTIVE && p.userId.toString() !== game.creatorId.toString()
    );

    // Notify all active participants
    const notificationPromises = activeParticipants.map((participant) =>
      this.notificationService.createNotification(
        participant.userId.toString(),
        NotificationType.GAME_COMPLETED,
        'Game Completed',
        `Your game "${game.title}" has been marked as completed.`,
        {
          gameId: gameId,
          gameTitle: game.title,
          completedAt: game.completedAt
        }
      )
    );

    // Execute all notifications in parallel
    await Promise.allSettled(notificationPromises);

    // Emit Socket.IO event to game room
    try {
      const io = getSocketServer();
      io.to(`game:${gameId}`).emit('game:completed', {
        gameId,
        status: GameStatus.ENDED,
        completedAt: game.completedAt,
        message: `Game "${game.title}" has been completed`,
        timestamp: new Date()
      });

      // Also emit to discovery room to update listings
      io.to('discovery').emit('game:updated', {
        gameId,
        status: GameStatus.ENDED,
        completedAt: game.completedAt
      });
    } catch (error) {
      console.error('Failed to emit game completion via Socket.IO:', error);
    }

    return {
      success: true,
      message: 'Game completed successfully',
      data: {
        gameId,
        status: GameStatus.ENDED,
        completedAt: game.completedAt
      }
    };
  }
}
