import AppError from "../../Share/utils/AppError";
import { UserRepository } from "../auth/auth.repository";
import bcrypt from "bcryptjs";

const userRepo = new UserRepository();

export class ProfileService {
  /**
   * Get user profile (no password)
   */
  static async getProfile(userId: string) {
    const user = await userRepo.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
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

  /**
   * Update user profile fields
   * Only updates fields that are provided
   */
  static async updateProfile(userId: string, updateData: any) {
    const user = await userRepo.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Update only provided fields
    const allowedFields = ["fullName", "phone", "favoriteGame", "place", "profilePicture"];
    const updates: any = {};

    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        updates[field] = updateData[field];
      }
    });

    const updatedUser = await userRepo.updateById(userId, updates);
    if (!updatedUser) {
      throw new AppError("Failed to update profile", 500);
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

  /**
   * Change user password
   * Validates current password before updating
   */
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {
    const user = await userRepo.findByIdWithPassword(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new AppError("Current password is incorrect", 401);
    }

    // Hash and save new password
    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    // Note: We do NOT invalidate tokens - user stays logged in
  }
}
