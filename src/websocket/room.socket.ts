import { Server, Socket } from "socket.io";

export const roomSocket = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    socket.on("leave-room", (roomId: string) => {
      socket.leave(roomId);
    });
  });
};
