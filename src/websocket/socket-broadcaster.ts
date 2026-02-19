import { Server, Socket } from 'socket.io';
import { PresenceTracker } from './presence-tracker';

/**
 * SocketBroadcaster — strongly-typed helpers for common emission patterns.
 */

export class SocketBroadcaster {
  constructor(private io: Server) {}

  /** Emit to all sockets belonging to a specific user */
  toUser<T>(userId: string, event: string, data: T): void {
    const socketIds = PresenceTracker.getSocketIds(userId);
    for (const sid of socketIds) {
      this.io.to(sid).emit(event, data);
    }
  }

  /** Emit to all users in a game room */
  toGame<T>(gameId: string, event: string, data: T): void {
    this.io.to(`game:${gameId}`).emit(event, data);
  }

  /** Emit to all users in a game room except sender */
  toGameExcept<T>(socket: Socket, gameId: string, event: string, data: T): void {
    socket.to(`game:${gameId}`).emit(event, data);
  }

  /** Emit to a list of userIds */
  toUsers<T>(userIds: string[], event: string, data: T): void {
    for (const userId of userIds) {
      this.toUser(userId, event, data);
    }
  }

  /** Emit to all connected clients */
  broadcast<T>(event: string, data: T): void {
    this.io.emit(event, data);
  }

  /** Emit with callback acknowledgement */
  toUserWithAck<T, R>(
    userId: string,
    event: string,
    data: T,
    timeout = 5000
  ): Promise<R | null> {
    const socketIds = PresenceTracker.getSocketIds(userId);
    const sid = socketIds[0];
    if (!sid) return Promise.resolve(null);

    return new Promise((resolve) => {
      const timer = setTimeout(() => resolve(null), timeout);
      this.io.to(sid).timeout(timeout).emit(event, data, (_err: Error | null, response: R) => {
        clearTimeout(timer);
        resolve(response ?? null);
      });
    });
  }
}
