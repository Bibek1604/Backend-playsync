import { UserRepository } from "./auth.repository";
import { RegisterUserDTO, RegisterAdminDTO, LoginDTO, AuthResponseDTO } from "./auth.dto";
import { signAccessToken, signRefreshToken } from "../../Share/config/jwt";
import AppError from "../../Share/utils/AppError";

const userRepository = new UserRepository();
const ADMIN_SECRET = process.env.ADMIN_SECRET || "your-super-secret-key-2025";

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
}