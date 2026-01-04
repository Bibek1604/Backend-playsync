"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.acceptRequest = exports.requestToJoin = exports.createRoom = void 0;
const room_model_1 = __importDefault(require("./room.model"));
const roomInvitation_model_1 = __importDefault(require("./roomInvitation.model"));
const mongoose_1 = require("mongoose");
const createRoom = async (name, gameId, creatorId) => {
    return await room_model_1.default.create({
        name,
        game: new mongoose_1.Types.ObjectId(gameId),
        creator: new mongoose_1.Types.ObjectId(creatorId),
        members: [new mongoose_1.Types.ObjectId(creatorId)]
    });
};
exports.createRoom = createRoom;
const requestToJoin = async (roomId, userId) => {
    return await roomInvitation_model_1.default.create({ room: roomId, user: userId });
};
exports.requestToJoin = requestToJoin;
const acceptRequest = async (invitationId) => {
    const invitation = await roomInvitation_model_1.default.findById(invitationId);
    if (!invitation)
        throw new Error("Invitation not found");
    invitation.status = "accepted";
    await invitation.save();
    await room_model_1.default.findByIdAndUpdate(invitation.room, {
        $addToSet: { members: invitation.user }
    });
    return invitation;
};
exports.acceptRequest = acceptRequest;
//# sourceMappingURL=room.service.js.map