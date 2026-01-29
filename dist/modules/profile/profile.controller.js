"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileController = void 0;
const profile_service_1 = require("./profile.service");
const AppError_1 = __importDefault(require("../../Share/utils/AppError"));
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
    static async uploadAvatar(req, res, next) {
        try {
            const file = req.file;
            if (!file)
                return next(new AppError_1.default("File is required", 400));
            const url = file.path;
            const updated = await profile_service_1.ProfileService.setAvatar(req.user.id, url);
            res.status(200).json({ success: true, message: "Avatar uploaded", data: updated });
        }
        catch (err) {
            next(err);
        }
    }
    static async uploadCoverPhoto(req, res, next) {
        try {
            const file = req.file;
            if (!file)
                return next(new AppError_1.default("File is required", 400));
            const url = file.path;
            const updated = await profile_service_1.ProfileService.setCoverPhoto(req.user.id, url);
            res.status(200).json({ success: true, message: "Cover photo uploaded", data: updated });
        }
        catch (err) {
            next(err);
        }
    }
    static async addPictures(req, res, next) {
        try {
            const files = req.files;
            if (!files || files.length === 0)
                return next(new AppError_1.default("Files are required", 400));
            const userId = req.user.id;
            const urls = files.map((f) => f.path);
            for (const url of urls) {
                await profile_service_1.ProfileService.addPicture(userId, url);
            }
            const profile = await profile_service_1.ProfileService.getProfile(userId);
            res.status(200).json({ success: true, message: "Pictures uploaded", data: { profile, added: urls } });
        }
        catch (err) {
            next(err);
        }
    }
    static async removePicture(req, res, next) {
        try {
            const { url } = req.body;
            const updated = await profile_service_1.ProfileService.removePicture(req.user.id, url);
            res.status(200).json({ success: true, message: "Picture removed", data: updated });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.ProfileController = ProfileController;
//# sourceMappingURL=profile.controller.js.map