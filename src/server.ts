
import dotenv from "dotenv";
import http from "http";
import app from "./app";
import connectDB from "./Share/config/db";
import logger from "./Share/utils/logger";
import gameCleanupJob from "./jobs/game.cleanup.job";
import { initializeSocketServer, getGameEventsEmitter } from "./websocket/socket.server";





dotenv.config();

const PORT = process.env.PORT || 5000;

(async () => {
  try {

    await connectDB();

    // Seed Admin
    const { seedAdmin } = await import("./modules/auth/auth.seeder");
    await seedAdmin();

    const server = http.createServer(app);

    // Initialize Socket.IO server
    initializeSocketServer(server);
    logger.info('✅ WebSocket server initialized');

    // Initialize game service with socket emitter (for real-time events)
    const { initializeGameService } = await import('./modules/game/game.service.factory');
    const gameEventsEmitter = getGameEventsEmitter();
    initializeGameService(gameEventsEmitter);
    logger.info('✅ Game service initialized with real-time events');

    // Start game cleanup cron job
    gameCleanupJob.start();

    server.listen(PORT, () => {
      logger.info(`Server running at http://localhost:${PORT}/swagger`);
      logger.info(`WebSocket server ready for connections`);
    });

  } catch (err) {
    logger.error("Startup error");
    console.error(err);
    process.exit(1);
  }
})();
