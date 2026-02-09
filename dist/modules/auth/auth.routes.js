"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const validateDto_1 = __importDefault(require("../../Share/utils/validateDto"));
const zod_1 = require("zod");
const auth_middleware_1 = require("./auth.middleware");
const registerUserSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2, "Full name must be at least 2 characters long"),
    email: zod_1.z.string().email("Invalid email address"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: zod_1.z.string().min(6, "Confirm password must be at least 6 characters long"),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});
const registerAdminSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2, "Full name must be at least 2 characters long"),
    email: zod_1.z.string().email("Invalid email address"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: zod_1.z.string().min(6, "Confirm password must be at least 6 characters long"),
    adminCode: zod_1.z.string().min(1, "Admin code is required"),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email address"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters long"),
});
const router = (0, express_1.Router)();
router.post("/register/user", (0, validateDto_1.default)(registerUserSchema), auth_controller_1.AuthController.registerUser);
router.post("/register/admin", (0, validateDto_1.default)(registerAdminSchema), auth_controller_1.AuthController.registerAdmin);
router.post("/login", (0, validateDto_1.default)(loginSchema), auth_controller_1.AuthController.login);
const refreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, "Refresh token is required"),
});
router.post("/refresh-token", (0, validateDto_1.default)(refreshTokenSchema), auth_controller_1.AuthController.refreshToken);
router.post("/logout", auth_middleware_1.auth, auth_controller_1.AuthController.logout);
router.get("/users", auth_middleware_1.auth, (0, auth_middleware_1.authorize)("admin"), auth_controller_1.AuthController.getAllUsers);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map