"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../auth/auth.middleware");
const game_controller_1 = require("./game.controller");
const router = (0, express_1.Router)();
router.post("/", auth_middleware_1.authenticate, game_controller_1.create);
router.get("/category/:categoryId", game_controller_1.getByCategory);
exports.default = router;
//# sourceMappingURL=game.routes.js.map