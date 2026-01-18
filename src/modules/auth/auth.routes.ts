    import {Router} from "express";
    import { AuthController } from "./auth.controller";
    import { validateDto } from "../../utils/validateDto";
    import { RegisterUserDTO, RegisterAdminDTO, LoginDTO } from "./auth.dto";
    import { z } from "zod";

    const registerUserSchema = z.object({
        fullName: z.string().min(2, "Full name must be at least 2 characters long"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(6, "Password must be at least 6 characters long"),
        confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters long"),
    }).refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    }); 
    const registerAdminSchema = z.object({
        fullName: z.string().min(2, "Full name must be at least 2 characters long"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(6, "Password must be at least 6 characters long"),
        confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters long"),
        adminCode: z.string().min(1, "Admin code is required"),
    }).refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });
    const loginSchema = z.object({
        email: z.string().email("Invalid email address"),
        password: z.string().min(6, "Password must be at least 6 characters long"),
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

    export default router;
