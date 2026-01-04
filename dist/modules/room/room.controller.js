"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accept = exports.join = exports.create = void 0;
const room_service_1 = require("./room.service");
const create = async (req, res) => {
    const room = await (0, room_service_1.createRoom)(req.body.name, req.body.gameId, req.user.id);
    res.status(201).json(room);
};
exports.create = create;
const join = async (req, res) => {
    const request = await (0, room_service_1.requestToJoin)(req.params.roomId, req.user.id);
    res.json(request);
};
exports.join = join;
const accept = async (req, res) => {
    const result = await (0, room_service_1.acceptRequest)(req.params.invitationId);
    res.json(result);
};
exports.accept = accept;
//# sourceMappingURL=room.controller.js.map