"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
const REFRESH_COOKIE_NAME = 'refreshToken';
const REFRESH_COOKIE_OPTIONS = (req) => ({
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    sameSite: 'strict',
    path: '/',
});
class AuthController {
    static async registerUser(req, res, next) {
        try {
            const authResponse = await auth_service_1.AuthService.registerUser(req.body);
            res.cookie(REFRESH_COOKIE_NAME, authResponse.refreshToken, REFRESH_COOKIE_OPTIONS(req));
            res.status(201).json({
                success: true,
                message: "User registered successfully",
                data: {
                    user: authResponse.user,
                },
            });
        }
        catch (err) {
            next(err);
        }
    }
    static async registerAdmin(req, res, next) {
        try {
            const authResponse = await auth_service_1.AuthService.registerAdmin(req.body);
            res.status(201).json({
                success: true,
                message: "Admin registered successfully",
                data: authResponse,
            });
        }
        catch (err) {
            next(err);
        }
    }
    static async login(req, res, next) {
        try {
            const authResponse = await auth_service_1.AuthService.login(req.body);
            res.status(200).json({
                success: true,
                message: "Login successful",
                data: authResponse,
            });
        }
        catch (err) {
            next(err);
        }
    }
    static async refreshToken(req, res, next) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                return res.status(400).json({ success: false, message: "Refresh token required" });
            }
            const authResponse = await auth_service_1.AuthService.refreshToken(refreshToken);
            res.status(200).json({
                success: true,
                message: "Token refreshed successfully",
                data: authResponse,
            });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map