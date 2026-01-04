"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../auth/auth.middleware");
const leaderboard_controller_1 = require("./leaderboard.controller");
const router = (0, express_1.Router)();
router.post("/update", auth_middleware_1.authenticate, leaderboard_controller_1.update);
router.get("/room/:roomId", auth_middleware_1.authenticate, leaderboard_controller_1.getByRoom);
exports.default = router;
//# sourceMappingURL=leaderboard.routes.js.map