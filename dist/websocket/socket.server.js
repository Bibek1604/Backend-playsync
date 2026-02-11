"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGameEventsEmitter = exports.getSocketServer = exports.initializeSocketServer = void 0;
const socket_io_1 = require("socket.io");
const game_events_1 = require("./game.events");
let io;
let gameEventsEmitter;
const initializeSocketServer = (httpServer) => {
    io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL || '*',
            methods: ['GET', 'POST'],
            credentials: true
        }
    });
    gameEventsEmitter = new game_events_1.GameEventsEmitter(io);
    io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.id}`);
        socket.on('join:discovery', () => {
            socket.join('discovery');
            console.log(`Socket ${socket.id} joined discovery room`);
        });
        socket.on('join:game', (gameId) => {
            socket.join(`game:${gameId}`);
            console.log(`Socket ${socket.id} joined game room: ${gameId}`);
        });
        socket.on('leave:game', (gameId) => {
            socket.leave(`game:${gameId}`);
            console.log(`Socket ${socket.id} left game room: ${gameId}`);
        });
        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${socket.id}`);
        });
    });
    console.log('✅ Socket.IO server initialized');
    return io;
};
exports.initializeSocketServer = initializeSocketServer;
const getSocketServer = () => {
    if (!io) {
        throw new Error('Socket.IO server not initialized. Call initializeSocketServer first.');
    }
    return io;
};
exports.getSocketServer = getSocketServer;
const getGameEventsEmitter = () => {
    if (!gameEventsEmitter) {
        throw new Error('Game Events Emitter not initialized. Call initializeSocketServer first.');
    }
    return gameEventsEmitter;
};
exports.getGameEventsEmitter = getGameEventsEmitter;
//# sourceMappingURL=socket.server.js.map