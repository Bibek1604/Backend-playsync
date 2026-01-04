"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLeaderboardByRoom = exports.updateScore = void 0;
const leaderboard_model_1 = __importDefault(require("./leaderboard.model"));
const updateScore = async (roomId, userId, score) => {
    return await leaderboard_model_1.default.findOneAndUpdate({ room: roomId, user: userId }, { score }, { upsert: true, new: true });
};
exports.updateScore = updateScore;
const getLeaderboardByRoom = async (roomId) => {
    return await leaderboard_model_1.default.find({ room: roomId })
        .populate("user", "username")
        .sort({ score: -1 });
};
exports.getLeaderboardByRoom = getLeaderboardByRoom;
//# sourceMappingURL=leaderboard.service.js.map