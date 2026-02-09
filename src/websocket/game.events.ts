/**
 * WebSocket Game Events Emitter
 * Real-time event broadcasting for game state changes
 */

import { Server as SocketServer } from 'socket.io';
import { GameStatus } from '../modules/game/game.types';

export enum GameEvent {
  GAME_CREATED = 'game:created',
  GAME_UPDATED = 'game:updated',
  GAME_DELETED = 'game:deleted',
  GAME_STATUS_CHANGED = 'game:status:changed',
  PLAYER_JOINED = 'game:player:joined',
  PLAYER_LEFT = 'game:player:left',
  SLOTS_UPDATED = 'game:slots:updated'
}

export interface IGameEventPlayer {
  id: string;
  username: string;
  profileImage?: string;
}

export class GameEventsEmitter {
  constructor(private io: SocketServer) {}

  /**
   * Notify when game status changes (OPEN ↔ FULL, ENDED)
   */
  emitGameStatusChange(gameId: string, status: GameStatus, availableSlots: number): void {
    // Emit to specific game room
    this.io.to(`game:${gameId}`).emit(GameEvent.GAME_STATUS_CHANGED, {
      gameId,
      status,
      availableSlots,
      timestamp: new Date()
    });

    // Also emit to discovery room for real-time listing updates
    this.io.to('discovery').emit(GameEvent.GAME_UPDATED, {
      gameId,
      status,
      availableSlots
    });
  }

  /**
   * Notify when player joins a game
   */
  emitPlayerJoined(
    gameId: string,
    player: IGameEventPlayer,
    currentPlayers: number,
    availableSlots: number
  ): void {
    // Emit to game room
    this.io.to(`game:${gameId}`).emit(GameEvent.PLAYER_JOINED, {
      gameId,
      player,
      currentPlayers,
      availableSlots,
      timestamp: new Date()
    });

    // Update discovery listing with new slot count
    this.io.to('discovery').emit(GameEvent.SLOTS_UPDATED, {
      gameId,
      currentPlayers,
      availableSlots
    });
  }

  /**
   * Notify when player leaves a game
   */
  emitPlayerLeft(
    gameId: string,
    playerId: string,
    currentPlayers: number,
    availableSlots: number
  ): void {
    // Emit to game room
    this.io.to(`game:${gameId}`).emit(GameEvent.PLAYER_LEFT, {
      gameId,
      playerId,
      currentPlayers,
      availableSlots,
      timestamp: new Date()
    });

    // Update discovery listing with new slot count
    this.io.to('discovery').emit(GameEvent.SLOTS_UPDATED, {
      gameId,
      currentPlayers,
      availableSlots
    });
  }

  /**
   * Notify when new game is created
   */
  emitGameCreated(gameId: string, gameData: any): void {
    this.io.to('discovery').emit(GameEvent.GAME_CREATED, {
      gameId,
      game: gameData,
      timestamp: new Date()
    });
  }

  /**
   * Notify when game is deleted
   */
  emitGameDeleted(gameId: string): void {
    this.io.to('discovery').emit(GameEvent.GAME_DELETED, {
      gameId,
      timestamp: new Date()
    });

    // Close the game room
    this.io.in(`game:${gameId}`).socketsLeave(`game:${gameId}`);
  }

  /**
   * Notify when game details are updated
   */
  emitGameUpdated(gameId: string, updateData: any): void {
    this.io.to(`game:${gameId}`).emit(GameEvent.GAME_UPDATED, {
      gameId,
      updates: updateData,
      timestamp: new Date()
    });

    this.io.to('discovery').emit(GameEvent.GAME_UPDATED, {
      gameId,
      updates: updateData
    });
  }
}
