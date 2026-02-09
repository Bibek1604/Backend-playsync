"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileService = void 0;
const AppError_1 = __importDefault(require("../../Share/utils/AppError"));
const auth_repository_1 = require("../auth/auth.repository");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userRepo = new auth_repository_1.UserRepository();
class ProfileService {
    static async getProfile(userId) {
        const user = await userRepo.findById(userId);
        if (!user) {
            throw new AppError_1.default("User not found", 404);
        }
        return {
            fullName: user.fullName,
            email: user.email,
            phone: user.phone || "",
            favoriteGame: user.favoriteGame || "",
            place: user.place || "",
            profilePicture: user.profilePicture || "",
        };
    }
    static async updateProfile(userId, updateData) {
        const user = await userRepo.findById(userId);
        if (!user) {
            throw new AppError_1.default("User not found", 404);
        }
        const allowedFields = ["fullName", "phone", "favoriteGame", "place", "profilePicture"];
        const updates = {};
        allowedFields.forEach(field => {
            if (updateData[field] !== undefined) {
                updates[field] = updateData[field];
            }
        });
        const updatedUser = await userRepo.updateById(userId, updates);
        if (!updatedUser) {
            throw new AppError_1.default("Failed to update profile", 500);
        }
        return {
            fullName: updatedUser.fullName,
            email: updatedUser.email,
            phone: updatedUser.phone || "",
            favoriteGame: updatedUser.favoriteGame || "",
            place: updatedUser.place || "",
            profilePicture: updatedUser.profilePicture || "",
        };
    }
    static async changePassword(userId, currentPassword, newPassword) {
        const user = await userRepo.findByIdWithPassword(userId);
        if (!user) {
            throw new AppError_1.default("User not found", 404);
        }
        const isPasswordValid = await user.comparePassword(currentPassword);
        if (!isPasswordValid) {
            throw new AppError_1.default("Current password is incorrect", 401);
        }
        user.password = await bcryptjs_1.default.hash(newPassword, 12);
        await user.save();
    }
}
exports.ProfileService = ProfileService;
//# sourceMappingURL=profile.service.js.map