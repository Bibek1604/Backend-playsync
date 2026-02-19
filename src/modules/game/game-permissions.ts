/**
 * GamePermissions — checks if a user is allowed to perform actions on a game.
 * Centralises permission logic rather than scattering it across controllers.
 */

export type GameAction =
  | 'join'
  | 'leave'
  | 'cancel'
  | 'complete'
  | 'invite'
  | 'kick'
  | 'edit'
  | 'delete'
  | 'view_details';

export interface GameLike {
  _id: string;
  createdBy: string;
  players: string[];
  status: string;
  isPrivate?: boolean;
}

export class GamePermissions {
  static can(userId: string, game: GameLike, action: GameAction): boolean {
    const isHost = String(game.createdBy) === String(userId);
    const isPlayer = game.players.map(String).includes(String(userId));
    const isOpen = game.status === 'open';
    const isOngoing = game.status === 'ongoing';

    switch (action) {
      case 'join':
        return !isPlayer && isOpen;
      case 'leave':
        return isPlayer && !isHost && (isOpen || isOngoing);
      case 'cancel':
        return isHost && (isOpen || isOngoing);
      case 'complete':
        return isHost && isOngoing;
      case 'invite':
        return isPlayer && isOpen;
      case 'kick':
        return isHost && (isOpen || isOngoing);
      case 'edit':
        return isHost && isOpen;
      case 'delete':
        return isHost && game.status === 'cancelled';
      case 'view_details':
        return !game.isPrivate || isPlayer;
      default:
        return false;
    }
  }

  static assert(userId: string, game: GameLike, action: GameAction): void {
    if (!GamePermissions.can(userId, game, action)) {
      throw new Error(`Permission denied: cannot perform '${action}' on this game.`);
    }
  }
}
