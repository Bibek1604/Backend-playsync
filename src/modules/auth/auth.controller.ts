import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";
import { RegisterAdminDTO, RegisterUserDTO, LoginDTO } from "./auth.dto";

const REFRESH_COOKIE_NAME = 'refreshToken';
const REFRESH_COOKIE_OPTIONS = (req: Request) => ({
  httpOnly: true,
  secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  sameSite: 'strict' as const,
  path: '/',
});

export class AuthController {
  /**
   * @swagger
   * /api/v1/auth/register/user:
   *   post:
   *     tags:
   *       - Authentication
   *     summary: Register a new user
   *     description: Register a new user account. User will need to verify email before logging in.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/RegisterUserRequest'
   *     responses:
   *       201:
   *         description: User registered successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/RegisterUserResponse'
   *       400:
   *         description: Bad request - Email already in use or validation error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  static async registerUser(
    req: Request<{}, {}, RegisterUserDTO>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const authResponse = await AuthService.registerUser(req.body);
      // FIXED: No cookie or tokens on registration
      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          user: authResponse.user, // Only return user data, no tokens
        },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/auth/register/admin:
   *   post:
   *     tags:
   *       - Authentication
   *     summary: Register a new admin
   *     description: Register a new admin account using admin code
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/RegisterAdminRequest'
   *     responses:
   *       201:
   *         description: Admin registered successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthResponse'
   *       400:
   *         description: Bad request - Email already in use or validation error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       401:
   *         description: Unauthorized - Invalid admin code
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  static async registerAdmin(
    req: Request<{}, {}, RegisterAdminDTO>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const authResponse = await AuthService.registerAdmin(req.body);
      res.status(201).json({
        success: true,
        message: "Admin registered successfully",
        data: authResponse,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/auth/login:
   *   post:
   *     tags:
   *       - Authentication
   *     summary: Login user or admin
   *     description: Authenticate user and receive access and refresh tokens
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/LoginRequest'
   *     responses:
   *       200:
   *         description: Login successful
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthResponse'
   *       401:
   *         description: Unauthorized - Invalid email or password
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  static async login(
    req: Request<{}, {}, LoginDTO>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const authResponse = await AuthService.login(req.body);
      res.status(200).json({
        success: true,
        message: "Login successful",
        data: authResponse,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/auth/refresh-token:
   *   post:
   *     tags:
   *       - Authentication
   *     summary: Refresh access token
   *     description: Get new access and refresh tokens using a valid refresh token
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/RefreshTokenRequest'
   *     responses:
   *       200:
   *         description: Token refreshed successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthResponse'
   *       400:
   *         description: Bad request - Refresh token required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       401:
   *         description: Unauthorized - Invalid refresh token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  static async refreshToken(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({ success: false, message: "Refresh token required" });
      }
      const authResponse = await AuthService.refreshToken(refreshToken);
      res.status(200).json({
        success: true,
        message: "Token refreshed successfully",
        data: authResponse,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/auth/users:
   *   get:
   *     tags:
   *       - Authentication
   *     summary: Get all users
   *     description: Retrieve list of all registered users (Admin only)
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Users retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UsersListResponse'
   *       401:
   *         description: Unauthorized - JWT token required
   *       403:
   *         description: Forbidden - Admin access required
   */
  static async getAllUsers(
    _req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const users = await AuthService.getAllUsers();
      res.status(200).json({
        success: true,
        message: "Users retrieved successfully",
        data: users,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/auth/logout:
   *   post:
   *     tags:
   *       - Authentication
   *     summary: Logout user
   *     description: Logout currently authenticated user and invalidate tokens
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Logged out successfully
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
   *                   example: Logged out successfully
   *       401:
   *         description: Unauthorized - JWT token required
   */
  static async logout(
    req: any,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (req.user && req.user.id) {
        await AuthService.logout(req.user.id);
      }
      res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (err) {
      next(err);
    }
  }
}