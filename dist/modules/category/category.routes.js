"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../auth/auth.middleware");
const category_controller_1 = require("./category.controller");
const router = (0, express_1.Router)();
router.post("/", auth_middleware_1.authenticate, category_controller_1.create);
router.get("/", category_controller_1.getAll);
exports.default = router;
//# sourceMappingURL=category.routes.js.map