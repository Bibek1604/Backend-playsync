import { Router } from "express";
import { AuthController } from "./auth.controller";
import validateDto from "../../Share/utils/validateDto";
import { RegisterUserDTO, RegisterAdminDTO, LoginDTO, ForgotPasswordDTO, ResetPasswordDTO } from "./auth.dto";
import { z } from "zod";
import { auth, authorize } from "./auth.middleware";

const registerUserSchema = z.object({
    fullName: z.string().min(2, "Full name must be at least 2 characters long"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters long"),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});
const registerAdminSchema = z.object({
    fullName: z.string().min(2, "Full name must be at least 2 characters long"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters long"),
    adminCode: z.string().min(1, "Admin code is required"),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});
const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
});

const forgotPasswordSchema = z.object({
    email: z.string().email("Invalid email address"),
});

const resetPasswordSchema = z.object({
    email: z.string().email("Invalid email address"),
    otp: z.string().length(6, "OTP must be exactly 6 digits").regex(/^\d+$/, "OTP must contain only numbers"),
    newPassword: z.string().min(8, "New password must be at least 8 characters long"),
    confirmPassword: z.string().min(8, "Confirm password must be at least 8 characters long"),
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

const router = Router();

router.post(
    "/register/user",
    validateDto(registerUserSchema),
    AuthController.registerUser
);
router.post(
    "/register/admin",
    validateDto(registerAdminSchema),
    AuthController.registerAdmin
);
router.post(
    "/login",
    validateDto(loginSchema),
    AuthController.login
);

const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, "Refresh token is required"),
});

router.post(
    "/refresh-token",
    validateDto(refreshTokenSchema),
    AuthController.refreshToken
);

router.post(
    "/forgot-password",
    validateDto(forgotPasswordSchema),
    AuthController.forgotPassword
);

router.post(
    "/reset-password",
    validateDto(resetPasswordSchema),
    AuthController.resetPassword
);

router.post(
    "/logout",
    auth,
    AuthController.logout
);

router.get(
    "/users",
    auth,
    authorize("admin"),
    AuthController.getAllUsers
);

export default router;
