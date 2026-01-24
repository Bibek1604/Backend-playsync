"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileController = void 0;
const profile_service_1 = require("./profile.service");
class ProfileController {
    static async createProfile(req, res, next) {
        try {
            const profile = await profile_service_1.ProfileService.createProfile(req.user.id, req.body);
            res.status(201).json({
                success: true,
                message: "Profile created successfully",
                data: profile,
            });
        }
        catch (err) {
            next(err);
        }
    }
    static async getProfile(req, res, next) {
        try {
            const profile = await profile_service_1.ProfileService.getProfile(req.user.id);
            if (!profile) {
                return res.status(404).json({
                    success: false,
                    message: "Profile not found",
                });
            }
            res.status(200).json({
                success: true,
                message: "Profile retrieved successfully",
                data: profile,
            });
        }
        catch (err) {
            next(err);
        }
    }
    static async updateProfile(req, res, next) {
        try {
            const profile = await profile_service_1.ProfileService.updateProfile(req.user.id, req.body);
            res.status(200).json({
                success: true,
                message: "Profile updated successfully",
                data: profile,
            });
        }
        catch (err) {
            next(err);
        }
    }
    static async updateName(req, res, next) {
        try {
            await profile_service_1.ProfileService.updateName(req.user.id, req.body);
            res.status(200).json({
                success: true,
                message: "Name updated successfully",
            });
        }
        catch (err) {
            next(err);
        }
    }
    static async resetPassword(req, res, next) {
        try {
            await profile_service_1.ProfileService.resetPassword(req.user.id, req.body);
            res.status(200).json({
                success: true,
                message: "Password reset successfully",
            });
        }
        catch (err) {
            next(err);
        }
    }
    static async deleteProfile(req, res, next) {
        try {
            const deleted = await profile_service_1.ProfileService.deleteProfile(req.user.id);
            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: "Profile not found",
                });
            }
            res.status(200).json({
                success: true,
                message: "Profile deleted successfully",
            });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.ProfileController = ProfileController;
//# sourceMappingURL=profile.controller.js.map