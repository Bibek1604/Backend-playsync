import { Server, Socket } from 'socket.io';

/**
 * SocketRoomManager — high-level helper for joining/leaving Socket.IO rooms
 * scoped to a specific namespace, with participant tracking.
 */

const roomParticipants = new Map<string, Set<string>>(); // roomId → Set<socketId>
const socketRooms = new Map<string, Set<string>>();       // socketId → Set<roomId>

export class SocketRoomManager {
  static join(socket: Socket, roomId: string): void {
    socket.join(roomId);

    if (!roomParticipants.has(roomId)) roomParticipants.set(roomId, new Set());
    roomParticipants.get(roomId)!.add(socket.id);

    if (!socketRooms.has(socket.id)) socketRooms.set(socket.id, new Set());
    socketRooms.get(socket.id)!.add(roomId);
  }

  static leave(socket: Socket, roomId: string): void {
    socket.leave(roomId);
    roomParticipants.get(roomId)?.delete(socket.id);
    socketRooms.get(socket.id)?.delete(roomId);

    if (roomParticipants.get(roomId)?.size === 0) {
      roomParticipants.delete(roomId);
    }
  }

  static leaveAll(socket: Socket): void {
    const rooms = socketRooms.get(socket.id) ?? new Set();
    for (const roomId of rooms) {
      socket.leave(roomId);
      roomParticipants.get(roomId)?.delete(socket.id);
    }
    socketRooms.delete(socket.id);
  }

  static getParticipants(roomId: string): string[] {
    return [...(roomParticipants.get(roomId) ?? [])];
  }

  static getParticipantCount(roomId: string): number {
    return roomParticipants.get(roomId)?.size ?? 0;
  }

  static getRoomsForSocket(socketId: string): string[] {
    return [...(socketRooms.get(socketId) ?? [])];
  }

  static broadcast<T>(io: Server, roomId: string, event: string, data: T): void {
    io.to(roomId).emit(event, data);
  }

  static broadcastExcept<T>(socket: Socket, roomId: string, event: string, data: T): void {
    socket.to(roomId).emit(event, data);
  }
}
