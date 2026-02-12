/**
 * Game Service Factory
 * Provides singleton instance of GameService with WebSocket support
 */

import { GameService } from './game.service';
import { GameEventsEmitter } from '../../websocket/game.events';

let gameServiceInstance: GameService | null = null;

/**
 * Initialize game service with WebSocket emitter
 */
export const initializeGameService = (emitter?: GameEventsEmitter): void => {
  gameServiceInstance = new GameService(emitter);
};

/**
 * Get game service instance
 */
export const getGameService = (): GameService => {
  if (!gameServiceInstance) {
    // Initialize without emitter if not yet initialized (for backwards compatibility)
    gameServiceInstance = new GameService();
  }
  return gameServiceInstance;
};
