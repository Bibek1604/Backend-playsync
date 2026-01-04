import { Request ,Response , NextFunction } from "express";
import { AuthService } from "./auth.service";
import { RegisterAdminDTO,RegisterUserDTO,LoginDTO } from "./auth.dto";

/**
 * Authentication Controller
 * Handles user and admin registration, login, and token refresh
 */
export class AuthController {
  /**
   * Register a new user
   * @route POST /auth/register/user
   * @param {RegisterUserDTO} req.body - { fullName, email, password }
   * @returns {Object} { success, message, data: { accessToken, refreshToken, user } }
   * @example
   * // Request:
   * POST /auth/register/user
   * { "fullName": "John Doe", "email": "john@example.com", "password": "password123" }
   * 
   * // Success Response (201):
   * { "success": true, "message": "User registered successfully", "data": { "accessToken": "...", "refreshToken": "...", "user": { "id": "...", "fullName": "John Doe", "email": "john@example.com", "role": "user" } } }
   * 
   * // Error Response (400):
   * { "success": false, "message": "Email already in use" }
   */
  static async registerUser(
    req: Request<{}, {}, RegisterUserDTO>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const authResponse = await AuthService.registerUser(req.body);
      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: authResponse,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Register a new admin
   * @route POST /auth/register/admin
   * @param {RegisterAdminDTO} req.body - { fullName, email, password, adminCode }
   * @returns {Object} { success, message, data: { accessToken, refreshToken, user } }
   * @example
   * // Request:
   * POST /auth/register/admin
   * { "fullName": "Admin User", "email": "admin@example.com", "password": "admin123", "adminCode": "your-super-secret-key-2025" }
   * 
   * // Success Response (201):
   * { "success": true, "message": "Admin registered successfully", "data": { "accessToken": "...", "refreshToken": "...", "user": { "id": "...", "fullName": "Admin User", "email": "admin@example.com", "role": "admin" } } }
   * 
   * // Error Response - Invalid Code (401):
   * { "success": false, "message": "Invalid admin code" }
   * 
   * // Error Response - Email Exists (400):
   * { "success": false, "message": "Email already in use" }
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
   * Login user or admin
   * @route POST /auth/login
   * @param {LoginDTO} req.body - { email, password }
   * @returns {Object} { success, message, data: { accessToken, refreshToken, user } }
   * @example
   * // Request:
   * POST /auth/login
   * { "email": "john@example.com", "password": "password123" }
   * 
   * // Success Response (200):
   * { "success": true, "message": "Login successful", "data": { "accessToken": "...", "refreshToken": "...", "user": { "id": "...", "fullName": "John Doe", "email": "john@example.com", "role": "user" } } }
   * 
   * // Error Response (401):
   * { "success": false, "message": "Invalid email or password" }
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
   * Refresh access token using refresh token
   * @route POST /auth/refresh-token
   * @param {Object} req.body - { refreshToken }
   * @returns {Object} { success, message, data: { accessToken, refreshToken, user } }
   * @example
   * // Request:
   * POST /auth/refresh-token
   * { "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
   * 
   * // Success Response (200):
   * { "success": true, "message": "Token refreshed successfully", "data": { "accessToken": "...", "refreshToken": "...", "user": { "id": "...", "fullName": "John Doe", "email": "john@example.com", "role": "user" } } }
   * 
   * // Error Response (401):
   * { "success": false, "message": "Invalid refresh token" }
   * 
   * // Error Response - Missing Token (400):
   * { "success": false, "message": "Refresh token required" }
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
}