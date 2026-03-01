import { Server as HttpServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import { GameEventsEmitter } from './game.events';
import { initializeChatHandlers } from '../modules/chat/chat.socket';
import { verifyToken } from '../Share/config/jwt';
import logger from '../Share/utils/logger';

let io: SocketServer;
let gameEventsEmitter: GameEventsEmitter;

// Track user's active game rooms for disconnect handling
interface UserGameMapping {
  userId: string;
  gameRooms: Set<string>;
  socketId: string;
  connectedAt: Date;
}

const activeUserSockets = new Map<string, UserGameMapping>();

/**
 * Socket.IO Authentication Middleware
 * Verifies JWT token before allowing connection
 */
const socketAuthMiddleware = async (socket: Socket, next: (err?: Error) => void) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
    
    if (!token) {
      logger.warn(`Socket ${socket.id} - Authentication failed: No token provided`);
      return next(new Error('Authentication required - No token provided'));
    }

    // Verify JWT token
    const decoded = verifyToken(token) as any;
    
    if (!decoded || !decoded.id) {
      logger.warn(`Socket ${socket.id} - Authentication failed: Invalid token`);
      return next(new Error('Authentication failed - Invalid token'));
    }

    // Attach user to socket
    (socket as any).user = {
      id: decoded.id,
      role: decoded.role
    };

    logger.info(`Socket ${socket.id} authenticated for user: ${decoded.id}`);
    next();
  } catch (error: any) {
    logger.error(`Socket authentication error: ${error.message}`);
    next(new Error('Authentication failed - Token verification error'));
  }
};

/**
 * Handle user disconnect and cleanup game rooms
 */
const handleDisconnect = async (socket: Socket) => {
  const user = (socket as any).user;
  
  if (!user) return;

  const userId = user.id;
  const userMapping = activeUserSockets.get(userId);

  if (userMapping) {
    logger.info(`User ${userId} disconnected from socket ${socket.id}`);
    
    // Auto-leave all game rooms (ghost player prevention)
    if (userMapping.gameRooms.size > 0) {
      logger.warn(`User ${userId} disconnected with ${userMapping.gameRooms.size} active game(s)`);
      
      // Note: Actual game leave logic should be handled by frontend
      // or through a heartbeat mechanism. This is just cleanup.
      for (const gameId of userMapping.gameRooms) {
        socket.leave(`game:${gameId}`);
      }
    }
    
    activeUserSockets.delete(userId);
  }

  logger.info(`Socket ${socket.id} disconnected - User: ${userId}`);
};

/**
 * Initialize Socket.IO server
 */
export const initializeSocketServer = (httpServer: HttpServer): SocketServer => {
  io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      methods: ['GET', 'POST'],
      credentials: true
    },
    // Connection timeout and ping settings
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Apply authentication middleware
  io.use(socketAuthMiddleware);

  // Initialize game events emitter
  gameEventsEmitter = new GameEventsEmitter(io);

  // Initialize chat handlers
  initializeChatHandlers(io);

  // Socket connection handling
  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    
    if (!user) {
      logger.error(`Socket ${socket.id} connected without user - should not happen!`);
      socket.disconnect();
      return;
    }

    const userId = user.id;
    logger.info(`✅ Socket ${socket.id} connected - User: ${userId}`);

    // Track user connection
    activeUserSockets.set(userId, {
      userId,
      gameRooms: new Set(),
      socketId: socket.id,
      connectedAt: new Date()
    });

    // Auto-join user-specific room (verified by JWT)
    socket.join(`user:${userId}`);
    logger.info(`Socket ${socket.id} auto-joined user room: user:${userId}`);

    // Join discovery room for game listing updates
    socket.on('join:discovery', () => {
      socket.join('discovery');
      logger.info(`Socket ${socket.id} joined discovery room`);
    });

    // Join specific game room (with tracking)
    socket.on('join:game', (gameId: string) => {
      if (!gameId || typeof gameId !== 'string') {
        logger.warn(`Invalid gameId received from ${socket.id}`);
        return;
      }

      socket.join(`game:${gameId}`);
      
      const userMapping = activeUserSockets.get(userId);
      if (userMapping) {
        userMapping.gameRooms.add(gameId);
      }
      
      logger.info(`User ${userId} joined game room: ${gameId}`);
    });

    // Leave specific game room (with tracking)
    socket.on('leave:game', (gameId: string) => {
      if (!gameId || typeof gameId !== 'string') {
        logger.warn(`Invalid gameId received from ${socket.id}`);
        return;
      }

      socket.leave(`game:${gameId}`);
      
      const userMapping = activeUserSockets.get(userId);
      if (userMapping) {
        userMapping.gameRooms.delete(gameId);
      }
      
      logger.info(`User ${userId} left game room: ${gameId}`);
    });

    // Game reconnection handler
    socket.on('game:reconnect', async (data: { gameId: string }, callback) => {
      try {
        if (!data?.gameId) {
          return callback?.({ success: false, error: 'Missing gameId' });
        }

        const { gameId } = data;
        
        // Import dynamically to avoid circular dependency
        const { GameRepository } = await import('../modules/game/game.repository');
        const gameRepo = new GameRepository();
        
        const game = await gameRepo.findById(gameId);
        
        if (!game) {
          return callback?.({ success: false, error: 'Game not found' });
        }

        // Check if user is participant
        const participant = game.participants.find(
          p => p.userId.toString() === userId && p.status === 'ACTIVE'
        );

        if (!participant) {
          return callback?.({ success: false, error: 'Not a participant' });
        }

        // Rejoin game room
        socket.join(`game:${gameId}`);
        
        const userMapping = activeUserSockets.get(userId);
        if (userMapping) {
          userMapping.gameRooms.add(gameId);
        }

        logger.info(`User ${userId} reconnected to game: ${gameId}`);
        
        callback?.({ 
          success: true, 
          game: {
            id: game._id,
            status: game.status,
            currentPlayers: game.currentPlayers
          }
        });
      } catch (error: any) {
        logger.error(`Game reconnect error: ${error.message}`);
        callback?.({ success: false, error: 'Reconnection failed' });
      }
    });

    // Heartbeat/ping handler (optional, for presence tracking)
    socket.on('heartbeat', () => {
      socket.emit('heartbeat:ack', { timestamp: Date.now() });
    });

    // Disconnect handling
    socket.on('disconnect', () => handleDisconnect(socket));
  });

  logger.info('✅ Socket.IO server initialized with authentication');
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

/**
 * Get active user connections (for monitoring)
 */
export const getActiveUserConnections = (): number => {
  return activeUserSockets.size;
};

/**
 * Check if user is currently connected
 */
export const isUserConnected = (userId: string): boolean => {
  return activeUserSockets.has(userId);
};
