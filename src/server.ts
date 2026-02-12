
import dotenv from "dotenv";
import http from "http";
import app from "./app";
import connectDB from "./Share/config/db";
import logger from "./Share/utils/logger";
import gameCleanupJob from "./jobs/game.cleanup.job";





dotenv.config();

const PORT = process.env.PORT || 5000;

(async () => {
  try {

    await connectDB();

    // Seed Admin
    const { seedAdmin } = await import("./modules/auth/auth.seeder");
    await seedAdmin();

    // Start game cleanup cron job
    gameCleanupJob.start();

    const server = http.createServer(app);

    server.listen(PORT, () => {
      logger.info(`Server running at http://localhost:${PORT}/swagger`);
    });

  } catch (err) {
    logger.error("Startup error");
    console.error(err);
    process.exit(1);
  }
})();
