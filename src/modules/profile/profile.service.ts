import { ProfileRepository } from "./profile.repository";
import { UserRepository } from "../auth/auth.repository";
import { CreateProfileDTO, UpdateProfileDTO, ProfileResponseDTO, UpdateNameDTO, PasswordResetDTO } from "./profile.dto";
import AppError from "../../Share/utils/AppError";
import mongoose from "mongoose";

const profileRepository = new ProfileRepository();
const userRepository = new UserRepository();

export class ProfileService {
  static async createProfile(userId: string, dto: CreateProfileDTO): Promise<ProfileResponseDTO> {
    const existingProfile = await profileRepository.findByUserId(userId);
    if (existingProfile) {
      throw new AppError("Profile already exists", 400);
    }

    const profile = await profileRepository.create({
      userId: new mongoose.Types.ObjectId(userId) as any,
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
      lastJoined: (user as any)?.createdAt,
      socialLinks: profile.socialLinks,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  static async getProfile(userId: string): Promise<ProfileResponseDTO | null> {
    const profile = await profileRepository.findByUserId(userId);
    const user = await userRepository.findById(userId);

    if (!profile && !user) {
      return null;
    }

    // If profile doesn't exist but user does, return partial data (or we could auto-create)
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
      lastJoined: (user as any)?.createdAt,
      socialLinks: profile?.socialLinks,
      createdAt: profile?.createdAt || new Date(),
      updatedAt: profile?.updatedAt || new Date(),
    };
  }

  static async updateProfile(userId: string, dto: UpdateProfileDTO): Promise<ProfileResponseDTO> {
    const profile = await profileRepository.updateByUserId(userId, dto);
    if (!profile) {
      throw new AppError("Profile not found", 404);
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
      lastJoined: (user as any)?.createdAt,
      socialLinks: profile.socialLinks,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  static async updateName(userId: string, dto: UpdateNameDTO): Promise<void> {
    const user = await userRepository.updateById(userId, { fullName: dto.fullName });
    if (!user) {
      throw new AppError("User not found", 404);
    }
  }

  static async resetPassword(userId: string, dto: PasswordResetDTO): Promise<void> {
    const user = await userRepository.findByIdWithPassword(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const isMatch = await user.comparePassword(dto.oldPassword);
    if (!isMatch) {
      throw new AppError("Incorrect old password", 401);
    }

    user.password = dto.newPassword;
    await user.save();
  }

  static async deleteProfile(userId: string): Promise<boolean> {
    return await profileRepository.deleteByUserId(userId);
  }
}