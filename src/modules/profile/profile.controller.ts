import { Request, Response, NextFunction } from "express";
import { ProfileService } from "./profile.service";
import { CreateProfileDTO, UpdateProfileDTO } from "./profile.dto";
import AppError from "../../Share/utils/AppError";
import { avatarUpload, coverUpload, picturesUpload } from "./profile.uploader";
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

  static async uploadAvatar(req: Request, res: Response, next: NextFunction) {
    try {
      const file = (req as any).file as Express.Multer.File | undefined;
      if (!file) return next(new AppError("File is required", 400));
      const url = `${req.protocol}://${req.get("host")}/uploads/avatars/${file.filename}`;
      const updated = await ProfileService.setAvatar((req as any).user.id, url);
      res.status(200).json({ success: true, message: "Avatar uploaded", data: updated });
    } catch (err) {
      next(err);
    }
  }

  static async uploadCoverPhoto(req: Request, res: Response, next: NextFunction) {
    try {
      const file = (req as any).file as Express.Multer.File | undefined;
      if (!file) return next(new AppError("File is required", 400));
      const url = `${req.protocol}://${req.get("host")}/uploads/covers/${file.filename}`;
      const updated = await ProfileService.setCoverPhoto((req as any).user.id, url);
      res.status(200).json({ success: true, message: "Cover photo uploaded", data: updated });
    } catch (err) {
      next(err);
    }
  }

  static async addPictures(req: Request, res: Response, next: NextFunction) {
    try {
      const files = (req as any).files as Express.Multer.File[] | undefined;
      if (!files || files.length === 0) return next(new AppError("Files are required", 400));
      const userId = (req as any).user.id;
      const urls = files.map((f) => `${req.protocol}://${req.get("host")}/uploads/pictures/${f.filename}`);
      for (const url of urls) {
        await ProfileService.addPicture(userId, url);
      }
      const profile = await ProfileService.getProfile(userId);
      res.status(200).json({ success: true, message: "Pictures uploaded", data: { profile, added: urls } });
    } catch (err) {
      next(err);
    }
  }

  static async removePicture(req: Request<{}, {}, { url: string }>, res: Response, next: NextFunction) {
    try {
      const { url } = req.body;
      const updated = await ProfileService.removePicture((req as any).user.id, url);
      res.status(200).json({ success: true, message: "Picture removed", data: updated });
    } catch (err) {
      next(err);
    }
  }
}