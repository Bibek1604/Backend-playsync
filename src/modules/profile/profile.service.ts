import AppError from "../../Share/utils/AppError";
import { ProfileRepository } from "./profile.repository";
import { CreateProfileDTO, UpdateProfileDTO } from "./profile.dto";
import { UserRepository } from "../auth/auth.repository";

const userRepo = new UserRepository();

export const ProfileService = {
  async createProfile(userId: string, dto: CreateProfileDTO) {
    const existing = await ProfileRepository.findByUserId(userId);
    if (existing) throw new AppError("Profile already exists", 400, "PROFILE_EXISTS");
    const created = await ProfileRepository.create({ userId, ...dto } as any);
    return created;
  },

  async getProfile(userId: string) {
    return ProfileRepository.findByUserId(userId);
  },

  async updateProfile(userId: string, dto: UpdateProfileDTO) {
    const updated = await ProfileRepository.updateByUserId(userId, dto as any);
    return updated; // upsert ensures it will exist
  },

  async updateName(userId: string, data: { fullName: string }) {
    const user = await userRepo.findById(userId);
    if (!user) throw new AppError("User not found", 404);
    await userRepo.updateById(userId, { fullName: data.fullName } as any);
  },

  async resetPassword(userId: string, data: { oldPassword: string; newPassword: string }) {
    const user = await userRepo.findByIdWithPassword(userId);
    if (!user) throw new AppError("User not found", 404);
    const valid = await user.comparePassword(data.oldPassword);
    if (!valid) throw new AppError("Old password incorrect", 400);
    user.password = data.newPassword as any;
    await user.save();
  },

  async deleteProfile(userId: string) {
    const deleted = await ProfileRepository.deleteByUserId(userId);
    return !!deleted;
  },

  async setAvatar(userId: string, url: string) {
    const updated = await ProfileRepository.setAvatar(userId, url);
    if (!updated) throw new AppError("Profile not found", 404);
    return updated;
  },

  async setCoverPhoto(userId: string, url: string) {
    const updated = await ProfileRepository.setCoverPhoto(userId, url);
    if (!updated) throw new AppError("Profile not found", 404);
    return updated;
  },

  async addPicture(userId: string, url: string) {
    const updated = await ProfileRepository.addPicture(userId, url);
    if (!updated) throw new AppError("Profile not found", 404);
    return updated;
  },

  async removePicture(userId: string, url: string) {
    const updated = await ProfileRepository.removePicture(userId, url);
    if (!updated) throw new AppError("Profile not found", 404);
    return updated;
  },
};
