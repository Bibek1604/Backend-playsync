"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getByRoom = exports.update = void 0;
const leaderboard_service_1 = require("./leaderboard.service");
const update = async (req, res) => {
    try {
        const { roomId, score } = req.body;
        const userId = req.user.id;
        const result = await (0, leaderboard_service_1.updateScore)(roomId, userId, score);
        res.json(result);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.update = update;
const getByRoom = async (req, res) => {
    try {
        const leaderboard = await (0, leaderboard_service_1.getLeaderboardByRoom)(req.params.roomId);
        res.json(leaderboard);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.getByRoom = getByRoom;
//# sourceMappingURL=leaderboard.controller.js.map