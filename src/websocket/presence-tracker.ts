/**
 * PresenceTracker — maintains a live map of userId → socketIds.
 * Supports multiple connections per user (e.g., phone + tablet).
 */

const userSockets = new Map<string, Set<string>>(); // userId → Set<socketId>
const socketUser = new Map<string, string>();        // socketId → userId

export class PresenceTracker {
  static connect(userId: string, socketId: string): void {
    if (!userSockets.has(userId)) userSockets.set(userId, new Set());
    userSockets.get(userId)!.add(socketId);
    socketUser.set(socketId, userId);
  }

  static disconnect(socketId: string): string | undefined {
    const userId = socketUser.get(socketId);
    if (userId) {
      socketUser.delete(socketId);
      userSockets.get(userId)?.delete(socketId);
      if (userSockets.get(userId)?.size === 0) {
        userSockets.delete(userId);
      }
    }
    return userId;
  }

  static isOnline(userId: string): boolean {
    return (userSockets.get(userId)?.size ?? 0) > 0;
  }

  static getSocketIds(userId: string): string[] {
    return [...(userSockets.get(userId) ?? [])];
  }

  static getUserId(socketId: string): string | undefined {
    return socketUser.get(socketId);
  }

  static getOnlineCount(): number {
    return userSockets.size;
  }

  static getOnlineUsers(): string[] {
    return [...userSockets.keys()];
  }

  static getConnectionCount(userId: string): number {
    return userSockets.get(userId)?.size ?? 0;
  }
}
