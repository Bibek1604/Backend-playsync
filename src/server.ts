import dotenv from "dotenv";
import http from "http";
import app from "./app";
import connectDB from "./config/db";
import { initSocket } from "./websocket/socket.server";
import { logger } from "./utils/logger";

dotenv.config();

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await connectDB();

    const server = http.createServer(app);

    initSocket(server);

    server.listen(PORT, () => {
      logger.info(`Server running at http://localhost:${PORT}/swagger`);
    });
  } catch (err) {
    logger.error("Startup error");
    console.error(err);
    process.exit(1);
  }
})();
