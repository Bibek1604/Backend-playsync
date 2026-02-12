"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileController = void 0;
const profile_service_1 = require("./profile.service");
const AppError_1 = __importDefault(require("../../Share/utils/AppError"));
class ProfileController {
    static async getProfile(req, res, next) {
        try {
            const userId = req.user.id;
            const profile = await profile_service_1.ProfileService.getProfile(userId);
            res.status(200).json({
                success: true,
                message: "Profile fetched successfully",
                data: profile,
            });
        }
        catch (err) {
            next(err);
        }
    }
    static async updateProfile(req, res, next) {
        try {
            const userId = req.user.id;
            const updateData = req.body;
            if (req.file) {
                updateData.profilePicture = `/uploads/${req.file.filename}`;
            }
            const updatedProfile = await profile_service_1.ProfileService.updateProfile(userId, updateData);
            res.status(200).json({
                success: true,
                message: "Profile updated successfully",
                data: updatedProfile,
            });
        }
        catch (err) {
            next(err);
        }
    }
    static async changePassword(req, res, next) {
        try {
            const userId = req.user.id;
            const { currentPassword, newPassword, confirmNewPassword } = req.body;
            if (!currentPassword || !newPassword || !confirmNewPassword) {
                throw new AppError_1.default("All password fields are required", 400);
            }
            if (newPassword !== confirmNewPassword) {
                throw new AppError_1.default("New password and confirmation do not match", 400);
            }
            await profile_service_1.ProfileService.changePassword(userId, currentPassword, newPassword);
            res.status(200).json({
                success: true,
                message: "Password changed successfully",
            });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.ProfileController = ProfileController;
//# sourceMappingURL=profile.controller.js.map