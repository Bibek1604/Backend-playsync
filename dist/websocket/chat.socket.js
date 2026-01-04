"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatSocket = void 0;
const chat_service_1 = require("../modules/chat/chat.service");
const chatSocket = (io) => {
    io.on("connection", (socket) => {
        socket.on("join-room", (roomId) => {
            socket.join(roomId);
        });
        socket.on("send-message", async ({ roomId, message }) => {
            const userId = socket.data.user.id;
            const savedMessage = await (0, chat_service_1.saveMessage)(roomId, userId, message);
            io.to(roomId).emit("new-message", {
                roomId,
                message: savedMessage.message,
                sender: socket.data.user,
                createdAt: savedMessage.get("createdAt")
            });
        });
        socket.on("disconnect", () => {
            console.log("User disconnected");
        });
    });
};
exports.chatSocket = chatSocket;
//# sourceMappingURL=chat.socket.js.map