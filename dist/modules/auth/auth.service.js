"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const auth_repository_1 = require("./auth.repository");
const jwt_1 = require("../../Share/config/jwt");
const AppError_1 = __importDefault(require("../../Share/utils/AppError"));
const userRepository = new auth_repository_1.UserRepository();
const ADMIN_SECRET = process.env.ADMIN_SECRET || "your-super-secret-key-2025";
class AuthService {
    static async refreshToken(refreshToken) {
        const user = await userRepository.findByEmailOrRefreshToken(refreshToken);
        if (!user || !user.refreshTokens.includes(refreshToken)) {
            throw new AppError_1.default("Invalid refresh token", 401);
        }
        const payload = (await Promise.resolve().then(() => __importStar(require("../../Share/config/jwt")))).verifyToken(refreshToken);
        if (!payload || user._id.toString() !== payload.id) {
            throw new AppError_1.default("Invalid refresh token payload", 401);
        }
        const accessToken = (0, jwt_1.signAccessToken)({ id: user._id.toString(), role: user.role });
        const newRefreshToken = (0, jwt_1.signRefreshToken)({ id: user._id.toString(), role: user.role });
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
    static async registerUser(dto) {
        if (dto.password !== dto.confirmPassword) {
            throw new AppError_1.default("Passwords do not match", 400);
        }
        const existingUser = await userRepository.findByEmail(dto.email);
        if (existingUser)
            throw new AppError_1.default("Email already in use", 400);
        const user = await userRepository.create({
            ...dto,
            role: "user",
        });
        return {
            accessToken: "",
            refreshToken: "",
            user: {
                id: user._id.toString(),
                fullName: user.fullName,
                email: user.email,
                role: user.role,
            },
        };
    }
    static async registerAdmin(dto) {
        if (dto.password !== dto.confirmPassword) {
            throw new AppError_1.default("Passwords do not match", 400);
        }
        if (dto.adminCode !== ADMIN_SECRET) {
            throw new AppError_1.default("Invalid admin code", 401);
        }
        const existingUser = await userRepository.findByEmail(dto.email);
        if (existingUser)
            throw new AppError_1.default("Email already in use", 400);
        const admin = await userRepository.create({
            ...dto,
            role: "admin",
        });
        const accessToken = (0, jwt_1.signAccessToken)({ id: admin._id.toString(), role: admin.role });
        const refreshToken = (0, jwt_1.signRefreshToken)({ id: admin._id.toString(), role: admin.role });
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
    static async login(dto) {
        const user = await userRepository.findByEmailWithPassword(dto.email);
        if (!user || !(await user.comparePassword(dto.password))) {
            throw new AppError_1.default("Invalid email or password", 401);
        }
        const accessToken = (0, jwt_1.signAccessToken)({ id: user._id.toString(), role: user.role });
        const refreshToken = (0, jwt_1.signRefreshToken)({ id: user._id.toString(), role: user.role });
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
    static async logout(userId) {
        const user = await userRepository.findById(userId);
        if (user) {
            user.refreshTokens = [];
            await user.save();
        }
    }
}
exports.AuthService = AuthService;
