/**
 * WebSocket Server Configuration
 * Socket.IO setup for real-time communication
 */

import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { GameEventsEmitter } from './game.events';

let io: SocketServer;
let gameEventsEmitter: GameEventsEmitter;

/**
 * Initialize Socket.IO server
 */
export const initializeSocketServer = (httpServer: HttpServer): SocketServer => {
  io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Initialize game events emitter
  gameEventsEmitter = new GameEventsEmitter(io);

  // Socket connection handling
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join discovery room for game listing updates
    socket.on('join:discovery', () => {
      socket.join('discovery');
      console.log(`Socket ${socket.id} joined discovery room`);
    });

    // Join specific game room
    socket.on('join:game', (gameId: string) => {
      socket.join(`game:${gameId}`);
      console.log(`Socket ${socket.id} joined game room: ${gameId}`);
    });

    // Leave specific game room
    socket.on('leave:game', (gameId: string) => {
      socket.leave(`game:${gameId}`);
      console.log(`Socket ${socket.id} left game room: ${gameId}`);
    });

    // Disconnect handling
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  console.log('✅ Socket.IO server initialized');
  return io;
};

/**
 * Get Socket.IO server instance
 */
export const getSocketServer = (): SocketServer => {
  if (!io) {
    throw new Error('Socket.IO server not initialized. Call initializeSocketServer first.');
  }
  return io;
};

/**
 * Get Game Events Emitter instance
 */
export const getGameEventsEmitter = (): GameEventsEmitter => {
  if (!gameEventsEmitter) {
    throw new Error('Game Events Emitter not initialized. Call initializeSocketServer first.');
  }
  return gameEventsEmitter;
};
