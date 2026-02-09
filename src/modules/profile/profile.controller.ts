import { Request, Response, NextFunction } from "express";
import { ProfileService } from "./profile.service";
import AppError from "../../Share/utils/AppError";

export class ProfileController {
  /**
   * @swagger
   * /api/v1/profile:
   *   get:
   *     tags:
   *       - Profile
   *     summary: Get user profile
   *     description: Retrieve the authenticated user's profile information
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Profile fetched successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: Profile fetched successfully
   *                 data:
   *                   type: object
   *                   properties:
   *                     _id:
   *                       type: string
   *                     fullName:
   *                       type: string
   *                     email:
   *                       type: string
   *                     phone:
   *                       type: string
   *                     favoriteGame:
   *                       type: string
   *                     place:
   *                       type: string
   *                     profilePicture:
   *                       type: string
   *       401:
   *         description: Unauthorized
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
   * @swagger
   * /api/v1/profile:
   *   put:
   *     tags:
   *       - Profile
   *     summary: Update user profile
   *     description: Update user profile information with optional profile picture upload
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               phone:
   *                 type: string
   *                 example: "+1234567890"
   *               favoriteGame:
   *                 type: string
   *                 example: "Chess"
   *               place:
   *                 type: string
   *                 example: "New York, USA"
   *               profilePicture:
   *                 type: string
   *                 format: binary
   *                 description: Profile picture (max 2MB, jpg/png)
   *     responses:
   *       200:
   *         description: Profile updated successfully
   *       401:
   *         description: Unauthorized
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
   * @swagger
   * /api/v1/profile/change-password:
   *   put:
   *     tags:
   *       - Profile
   *     summary: Change user password
   *     description: Change the authenticated user's password
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - currentPassword
   *               - newPassword
   *               - confirmNewPassword
   *             properties:
   *               currentPassword:
   *                 type: string
   *                 format: password
   *                 example: "oldPassword123"
   *               newPassword:
   *                 type: string
   *                 format: password
   *                 minLength: 6
   *                 example: "newPassword123"
   *               confirmNewPassword:
   *                 type: string
   *                 format: password
   *                 example: "newPassword123"
   *     responses:
   *       200:
   *         description: Password changed successfully
   *       400:
   *         description: Invalid input or passwords don't match
   *       401:
   *         description: Unauthorized or current password incorrect
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