"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessagesByRoom = exports.saveMessage = void 0;
const chat_model_1 = __importDefault(require("./chat.model"));
const saveMessage = async (roomId, senderId, message) => {
    return await chat_model_1.default.create({
        room: roomId,
        sender: senderId,
        message
    });
};
exports.saveMessage = saveMessage;
const getMessagesByRoom = async (roomId) => {
    return await chat_model_1.default.find({ room: roomId })
        .populate("sender", "username")
        .sort({ createdAt: 1 });
};
exports.getMessagesByRoom = getMessagesByRoom;
//# sourceMappingURL=chat.service.js.map