"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../auth/auth.middleware");
const room_controller_1 = require("./room.controller");
const router = (0, express_1.Router)();
router.post("/", auth_middleware_1.authenticate, room_controller_1.create);
router.post("/:roomId/join", auth_middleware_1.authenticate, room_controller_1.join);
router.post("/accept/:invitationId", auth_middleware_1.authenticate, room_controller_1.accept);
exports.default = router;
//# sourceMappingURL=room.routes.js.map