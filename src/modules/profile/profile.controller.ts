import { Request, Response, NextFunction } from "express";
import { ProfileService } from "./profile.service";
import AppError from "../../Share/utils/AppError";

export class ProfileController {
  /**
   * Get user profile
   * @route GET /api/v1/profile
   * @access Protected
   */
  static async getProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = (req as any).user.id;
      const profile = await ProfileService.getProfile(userId);

      res.status(200).json({
        success: true,
        message: "Profile fetched successfully",
        data: profile,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Update user profile (text fields + optional profile picture)
   * @route PUT /api/v1/profile
   * @access Protected
   * @multipart profilePicture (optional, jpg/png, max 2MB)
   */
  static async updateProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = (req as any).user.id;
      const updateData = req.body;

      // If file uploaded, add to updateData
      if ((req as any).file) {
        updateData.profilePicture = `/uploads/${(req as any).file.filename}`;
      }

      const updatedProfile = await ProfileService.updateProfile(userId, updateData);

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: updatedProfile,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Change user password
   * @route PUT /api/v1/profile/change-password
   * @access Protected
   * @body { currentPassword, newPassword, confirmNewPassword }
   */
  static async changePassword(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = (req as any).user.id;
      const { currentPassword, newPassword, confirmNewPassword } = req.body;

      // Validate all fields present
      if (!currentPassword || !newPassword || !confirmNewPassword) {
        throw new AppError("All password fields are required", 400);
      }

      // Validate new password matches confirmation
      if (newPassword !== confirmNewPassword) {
        throw new AppError("New password and confirmation do not match", 400);
      }

      await ProfileService.changePassword(userId, currentPassword, newPassword);

      res.status(200).json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (err) {
      next(err);
    }
  }
}