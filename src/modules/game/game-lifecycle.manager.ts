/**
 * GameLifecycleManager — transitions game between states with validation.
 * Enforces: open → ongoing → completed | cancelled
 */

export type GameStatus = 'open' | 'ongoing' | 'completed' | 'cancelled';

const VALID_TRANSITIONS: Record<GameStatus, GameStatus[]> = {
  open: ['ongoing', 'cancelled'],
  ongoing: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

export interface GameLifecycleEvent {
  from: GameStatus;
  to: GameStatus;
  gameId: string;
  triggeredBy: string;
  timestamp: Date;
}

export class GameLifecycleManager {
  static canTransition(from: GameStatus, to: GameStatus): boolean {
    return VALID_TRANSITIONS[from].includes(to);
  }

  static assertTransition(from: GameStatus, to: GameStatus, gameId: string): void {
    if (!GameLifecycleManager.canTransition(from, to)) {
      throw new Error(
        `Invalid game state transition: ${from} → ${to} (gameId: ${gameId})`
      );
    }
  }

  static createEvent(
    gameId: string,
    from: GameStatus,
    to: GameStatus,
    triggeredBy: string
  ): GameLifecycleEvent {
    GameLifecycleManager.assertTransition(from, to, gameId);
    return { from, to, gameId, triggeredBy, timestamp: new Date() };
  }

  static isTerminal(status: GameStatus): boolean {
    return VALID_TRANSITIONS[status].length === 0;
  }

  static allowedNextStates(current: GameStatus): GameStatus[] {
    return VALID_TRANSITIONS[current];
  }
}
