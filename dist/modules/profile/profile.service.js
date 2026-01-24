"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileService = void 0;
const profile_repository_1 = require("./profile.repository");
const auth_repository_1 = require("../auth/auth.repository");
const AppError_1 = __importDefault(require("../../Share/utils/AppError"));
const mongoose_1 = __importDefault(require("mongoose"));
const profileRepository = new profile_repository_1.ProfileRepository();
const userRepository = new auth_repository_1.UserRepository();
class ProfileService {
    static async createProfile(userId, dto) {
        const existingProfile = await profileRepository.findByUserId(userId);
        if (existingProfile) {
            throw new AppError_1.default("Profile already exists", 400);
        }
        const profile = await profileRepository.create({
            userId: new mongoose_1.default.Types.ObjectId(userId),
            ...dto,
        });
        const user = await userRepository.findById(userId);
        return {
            id: profile._id.toString(),
            userId: profile.userId.toString(),
            fullName: user?.fullName,
            email: user?.email,
            bio: profile.bio,
            avatar: profile.avatar,
            location: profile.location,
            website: profile.website,
            favoriteGame: profile.favoriteGame,
            lastJoined: user?.createdAt,
            socialLinks: profile.socialLinks,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
        };
    }
    static async getProfile(userId) {
        const profile = await profileRepository.findByUserId(userId);
        const user = await userRepository.findById(userId);
        if (!profile && !user) {
            return null;
        }
        return {
            id: profile?._id.toString() || "",
            userId: userId,
            fullName: user?.fullName,
            email: user?.email,
            bio: profile?.bio,
            avatar: profile?.avatar,
            location: profile?.location,
            website: profile?.website,
            favoriteGame: profile?.favoriteGame,
            lastJoined: user?.createdAt,
            socialLinks: profile?.socialLinks,
            createdAt: profile?.createdAt || new Date(),
            updatedAt: profile?.updatedAt || new Date(),
        };
    }
    static async updateProfile(userId, dto) {
        const profile = await profileRepository.updateByUserId(userId, dto);
        if (!profile) {
            throw new AppError_1.default("Profile not found", 404);
        }
        const user = await userRepository.findById(userId);
        return {
            id: profile._id.toString(),
            userId: profile.userId.toString(),
            fullName: user?.fullName,
            email: user?.email,
            bio: profile.bio,
            avatar: profile.avatar,
            location: profile.location,
            website: profile.website,
            favoriteGame: profile.favoriteGame,
            lastJoined: user?.createdAt,
            socialLinks: profile.socialLinks,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
        };
    }
    static async updateName(userId, dto) {
        const user = await userRepository.updateById(userId, { fullName: dto.fullName });
        if (!user) {
            throw new AppError_1.default("User not found", 404);
        }
    }
    static async resetPassword(userId, dto) {
        const user = await userRepository.findByIdWithPassword(userId);
        if (!user) {
            throw new AppError_1.default("User not found", 404);
        }
        const isMatch = await user.comparePassword(dto.oldPassword);
        if (!isMatch) {
            throw new AppError_1.default("Incorrect old password", 401);
        }
        user.password = dto.newPassword;
        await user.save();
    }
    static async deleteProfile(userId) {
        return await profileRepository.deleteByUserId(userId);
    }
}
exports.ProfileService = ProfileService;
//# sourceMappingURL=profile.service.js.map