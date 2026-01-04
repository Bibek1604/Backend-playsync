"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomSocket = void 0;
const roomSocket = (io) => {
    io.on("connection", (socket) => {
        socket.on("leave-room", (roomId) => {
            socket.leave(roomId);
        });
    });
};
exports.roomSocket = roomSocket;
//# sourceMappingURL=room.socket.js.map