"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const initSocket = (server) => {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: "*"
        }
    });
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token)
            return next(new Error("Authentication error"));
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "playsync_secret");
            socket.data.user = decoded;
            next();
        }
        catch {
            next(new Error("Authentication error"));
        }
    });
    io.on("connection", (socket) => {
        console.log("User connected:", socket.data.user.id);
    });
    return io;
};
exports.initSocket = initSocket;
//# sourceMappingURL=socket.server.js.map