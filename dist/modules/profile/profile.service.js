"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileService = void 0;
const AppError_1 = __importDefault(require("../../Share/utils/AppError"));
const profile_repository_1 = require("./profile.repository");
const auth_repository_1 = require("../auth/auth.repository");
const userRepo = new auth_repository_1.UserRepository();
exports.ProfileService = {
    async createProfile(userId, dto) {
        const existing = await profile_repository_1.ProfileRepository.findByUserId(userId);
        if (existing)
            throw new AppError_1.default("Profile already exists", 400, "PROFILE_EXISTS");
        const { name, ...profileData } = dto;
        if (name) {
            await exports.ProfileService.updateName(userId, { fullName: name });
        }
        const created = await profile_repository_1.ProfileRepository.create({ userId, ...profileData });
        return created;
    },
    async getProfile(userId) {
        return profile_repository_1.ProfileRepository.findByUserId(userId);
    },
    async updateProfile(userId, dto) {
        if (dto.name) {
            await exports.ProfileService.updateName(userId, { fullName: dto.name });
        }
        if (dto.currentPassword && dto.changePassword) {
            await exports.ProfileService.resetPassword(userId, {
                oldPassword: dto.currentPassword,
                newPassword: dto.changePassword
            });
        }
        const profileData = {};
        if (dto.number)
            profileData.number = dto.number;
        if (dto.place)
            profileData.place = dto.place;
        if (dto.favouriteGame)
            profileData.favouriteGame = dto.favouriteGame;
        if (dto.avatar)
            profileData.avatar = dto.avatar;
        const updated = await profile_repository_1.ProfileRepository.updateByUserId(userId, profileData);
        return updated;
    },
    async updateName(userId, data) {
        const user = await userRepo.findById(userId);
        if (!user)
            throw new AppError_1.default("User not found", 404);
        await userRepo.updateById(userId, { fullName: data.fullName });
    },
    async resetPassword(userId, data) {
        const user = await userRepo.findByIdWithPassword(userId);
        if (!user)
            throw new AppError_1.default("User not found", 404);
        const valid = await user.comparePassword(data.oldPassword);
        if (!valid)
            throw new AppError_1.default("Old password incorrect", 400);
        user.password = data.newPassword;
        await user.save();
    },
    async deleteProfile(userId) {
        const deleted = await profile_repository_1.ProfileRepository.deleteByUserId(userId);
        return !!deleted;
    },
    async setAvatar(userId, url) {
        const updated = await profile_repository_1.ProfileRepository.setAvatar(userId, url);
        if (!updated)
            throw new AppError_1.default("Profile not found", 404);
        return updated;
    },
    async setCoverPhoto(userId, url) {
        const updated = await profile_repository_1.ProfileRepository.setCoverPhoto(userId, url);
        if (!updated)
            throw new AppError_1.default("Profile not found", 404);
        return updated;
    },
    async addPicture(userId, url) {
        const updated = await profile_repository_1.ProfileRepository.addPicture(userId, url);
        if (!updated)
            throw new AppError_1.default("Profile not found", 404);
        return updated;
    },
    async removePicture(userId, url) {
        const updated = await profile_repository_1.ProfileRepository.removePicture(userId, url);
        if (!updated)
            throw new AppError_1.default("Profile not found", 404);
        return updated;
    },
};
//# sourceMappingURL=profile.service.js.map