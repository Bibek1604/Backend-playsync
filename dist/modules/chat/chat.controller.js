"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoomMessages = void 0;
const chat_service_1 = require("./chat.service");
const getRoomMessages = async (req, res) => {
    const messages = await (0, chat_service_1.getMessagesByRoom)(req.params.roomId);
    res.json(messages);
};
exports.getRoomMessages = getRoomMessages;
//# sourceMappingURL=chat.controller.js.map