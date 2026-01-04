import { Server, Socket } from "socket.io";
import { saveMessage } from "../modules/chat/chat.service";

export const chatSocket = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    socket.on("join-room", (roomId: string) => {
      socket.join(roomId);
    });

    socket.on(
      "send-message",
      async ({ roomId, message }: { roomId: string; message: string }) => {
        const userId = socket.data.user.id;

        const savedMessage = await saveMessage(roomId, userId, message);

        io.to(roomId).emit("new-message", {
          roomId,
          message: savedMessage.message,
          sender: socket.data.user,
          createdAt: savedMessage.get("createdAt")
        });
      }
    );

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
};
