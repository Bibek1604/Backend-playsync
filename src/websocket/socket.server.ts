import { Server } from "socket.io";
import http from "http";
import jwt from "jsonwebtoken";

export const initSocket = (server: http.Server) => {
  const io = new Server(server, {
    cors: {
      origin: true, // Reflects the request origin, allowing all origins with credentials
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication error"));

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "playsync_secret"
      );
      socket.data.user = decoded;
      next();
    } catch {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.data.user.id);
  });

  return io;
};
