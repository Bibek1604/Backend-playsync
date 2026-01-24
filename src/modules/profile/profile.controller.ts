import { Request, Response, NextFunction } from "express";
import { ProfileService } from "./profile.service";
import { CreateProfileDTO, UpdateProfileDTO } from "./profile.dto";

export class ProfileController {
  /**
   * Create a new profile
   * @route POST /api/v1/profile
   * @param {CreateProfileDTO} req.body - Profile data
   * @returns {Object} { success, message, data: profile }
   */
  static async createProfile(
    req: Request<{}, {}, CreateProfileDTO>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const profile = await ProfileService.createProfile((req as any).user.id, req.body);
      res.status(201).json({
        success: true,
        message: "Profile created successfully",
        data: profile,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get user profile
   * @route GET /api/v1/profile
   * @returns {Object} { success, message, data: profile }
   */
  static async getProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const profile = await ProfileService.getProfile((req as any).user.id);
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
    } catch (err) {
      next(err);
    }
  }

  /**
   * Update user profile
   * @route PUT /api/v1/profile
   * @param {UpdateProfileDTO} req.body - Updated profile data
   * @returns {Object} { success, message, data: profile }
   */
  static async updateProfile(
    req: Request<{}, {}, UpdateProfileDTO>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const profile = await ProfileService.updateProfile((req as any).user.id, req.body);
      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: profile,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Update user name
   * @route PATCH /api/v1/profile/name
   * @param {UpdateNameDTO} req.body - New full name
   * @returns {Object} { success, message }
   */
  static async updateName(
    req: Request<{}, {}, { fullName: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      await ProfileService.updateName((req as any).user.id, req.body);
      res.status(200).json({
        success: true,
        message: "Name updated successfully",
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Reset password
   * @route PATCH /api/v1/profile/reset-password
   * @param {PasswordResetDTO} req.body - Old and new passwords
   * @returns {Object} { success, message }
   */
  static async resetPassword(
    req: Request<{}, {}, any>,
    res: Response,
    next: NextFunction
  ) {
    try {
      await ProfileService.resetPassword((req as any).user.id, req.body);
      res.status(200).json({
        success: true,
        message: "Password reset successfully",
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Delete user profile
   * @route DELETE /api/v1/profile
   * @returns {Object} { success, message }
   */
  static async deleteProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const deleted = await ProfileService.deleteProfile((req as any).user.id);
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
    } catch (err) {
      next(err);
    }
  }
}