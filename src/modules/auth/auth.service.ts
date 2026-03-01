import { UserRepository } from "./auth.repository";
import { RegisterUserDTO, RegisterAdminDTO, LoginDTO, AuthResponseDTO, ForgotPasswordDTO, ResetPasswordDTO } from "./auth.dto";
import { signAccessToken, signRefreshToken } from "../../Share/config/jwt";
import AppError from "../../Share/utils/AppError";
import { sendPasswordResetOTP } from "../../Share/utils/emailService";
import crypto from "crypto";

const userRepository = new UserRepository();
const ADMIN_SECRET = process.env.ADMIN_SECRET || "your-super-secret-key-2025";

// OTP expiry time in minutes
const OTP_EXPIRY_MINUTES = 10;

export class AuthService {
  static async refreshToken(refreshToken: string): Promise<AuthResponseDTO> {
    const user = await userRepository.findByEmailOrRefreshToken(refreshToken);
    if (!user || !user.refreshTokens.includes(refreshToken)) {
      throw new AppError("Invalid refresh token", 401);
    }
    const payload = (await import("../../Share/config/jwt")).verifyToken(refreshToken) as any;
    if (!payload || user._id.toString() !== payload.id) {
      throw new AppError("Invalid refresh token payload", 401);
    }
    const accessToken = signAccessToken({ id: user._id.toString(), role: user.role });
    const newRefreshToken = signRefreshToken({ id: user._id.toString(), role: user.role });
    user.refreshTokens = [newRefreshToken];
    await user.save();
    return {
      accessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    };
  }
  static async registerUser(dto: RegisterUserDTO): Promise<AuthResponseDTO> {
    if (dto.password !== dto.confirmPassword) {
      throw new AppError("Passwords do not match", 400);
    }
    const existingUser = await userRepository.findByEmail(dto.email);
    if (existingUser) throw new AppError("Email already in use", 400);

    const user = await userRepository.create({
      ...dto,
      role: "user",
    });

    // FIXED: Registration should NOT generate tokens
    // Users must login separately after registration
    return {
      accessToken: "", // Empty token for registration
      refreshToken: "", // Empty token for registration
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    };
  }

  static async registerAdmin(dto: RegisterAdminDTO): Promise<AuthResponseDTO> {
    if (dto.password !== dto.confirmPassword) {
      throw new AppError("Passwords do not match", 400);
    }
    if (dto.adminCode !== ADMIN_SECRET) {
      throw new AppError("Invalid admin code", 401);
    }

    const existingUser = await userRepository.findByEmail(dto.email);
    if (existingUser) throw new AppError("Email already in use", 400);

    const admin = await userRepository.create({
      ...dto,
      role: "admin",
    });

    const accessToken = signAccessToken({ id: admin._id.toString(), role: admin.role });
    const refreshToken = signRefreshToken({ id: admin._id.toString(), role: admin.role });

    // Save refresh token to admin
    admin.refreshTokens = [refreshToken];
    await admin.save();

    return {
      accessToken,
      refreshToken,
      user: {
        id: admin._id.toString(),
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role,
      },
    };
  }

  static async login(dto: LoginDTO): Promise<AuthResponseDTO> {
    const user = await userRepository.findByEmailWithPassword(dto.email);
    if (!user || !(await user.comparePassword(dto.password))) {
      throw new AppError("Invalid email or password", 401);
    }

    const accessToken = signAccessToken({ id: user._id.toString(), role: user.role });
    const refreshToken = signRefreshToken({ id: user._id.toString(), role: user.role });

    user.refreshTokens = [refreshToken];
    await user.save();

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    };
  }

  static async getAllUsers() {
    return await userRepository.findAll({ role: "user" });
  }

  static async logout(userId: string) {
    const user = await userRepository.findById(userId);
    if (user) {
      user.refreshTokens = [];
      await user.save();
    }
  }

  /**
   * Generate a 6-digit OTP
   */
  private static generateOTP(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Forgot Password - Send OTP to user's email
   */
  static async forgotPassword(dto: ForgotPasswordDTO): Promise<void> {
    // Find user by email
    const user = await userRepository.findByEmail(dto.email);
    
    if (!user) {
      // Don't reveal if email exists or not (security best practice)
      throw new AppError("If this email is registered, you will receive a password reset OTP", 200);
    }

    // Generate 6-digit OTP
    const otp = this.generateOTP();
    
    // Set OTP expiry time (10 minutes from now)
    const otpExpiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Save OTP and expiry in database
    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpires = otpExpiry;
    await user.save({ validateBeforeSave: false });

    // Send OTP email
    const emailSent = await sendPasswordResetOTP(user.email, otp, user.fullName);

    if (!emailSent) {
      // Clear OTP if email fails
      user.resetPasswordOTP = undefined;
      user.resetPasswordOTPExpires = undefined;
      await user.save({ validateBeforeSave: false });
      
      throw new AppError("Failed to send reset email. Please try again later.", 500);
    }
  }

  /**
   * Reset Password using OTP
   */
  static async resetPassword(dto: ResetPasswordDTO): Promise<void> {
    // Validate password match
    if (dto.newPassword !== dto.confirmPassword) {
      throw new AppError("Passwords do not match", 400);
    }

    // Find user with OTP fields selected
    const user = await userRepository.findByEmail(dto.email);
    
    if (!user) {
      throw new AppError("Invalid or expired OTP", 400);
    }

    // Manually select OTP fields (since they're excluded by default)
    const userWithOTP = await userRepository.findByEmailWithOTP(dto.email);
    
    if (!userWithOTP) {
      throw new AppError("Invalid or expired OTP", 400);
    }

    // Check if OTP exists and matches
    if (!userWithOTP.resetPasswordOTP || userWithOTP.resetPasswordOTP !== dto.otp) {
      throw new AppError("Invalid or expired OTP", 400);
    }

    // Check if OTP is expired
    if (!userWithOTP.resetPasswordOTPExpires || userWithOTP.resetPasswordOTPExpires < new Date()) {
      throw new AppError("OTP has expired. Please request a new one.", 400);
    }

    // Update password (will be hashed by pre-save hook)
    userWithOTP.password = dto.newPassword;
    
    // Clear OTP fields
    userWithOTP.resetPasswordOTP = undefined;
    userWithOTP.resetPasswordOTPExpires = undefined;
    
    // Clear all refresh tokens (logout from all devices)
    userWithOTP.refreshTokens = [];
    
    // Update password changed timestamp
    userWithOTP.passwordChangedAt = new Date();
    
    await userWithOTP.save();
  }
}