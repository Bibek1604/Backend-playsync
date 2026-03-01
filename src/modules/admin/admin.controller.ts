import { Request, Response } from 'express';
import adminService from './admin.service';
import asyncHandler from '../../Share/utils/asyncHandler';
import { sendSuccess } from '../../Share/utils/apiResponse';

class AdminController {
  /**
   * @route   GET /api/v1/admin/users
   * @desc    Get paginated list of all users
   * @access  Admin
   */
  getUsers = asyncHandler(async (req: Request, res: Response) => {
    const result = await adminService.getUsers(req.query as any);
    sendSuccess(res, result, 'Users retrieved successfully');
  });

  /**
   * @route   GET /api/v1/admin/users/:userId
   * @desc    Get detailed user information
   * @access  Admin
   */
  getUserById = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const user = await adminService.getUserById(userId);
    sendSuccess(res, user, 'User details retrieved successfully');
  });

  /**
   * @route   GET /api/v1/admin/games
   * @desc    Get paginated list of all games
   * @access  Admin
   */
  getGames = asyncHandler(async (req: Request, res: Response) => {
    const result = await adminService.getGames(req.query as any);
    sendSuccess(res, result, 'Games retrieved successfully');
  });

  /**
   * @route   GET /api/v1/admin/games/online
   * @desc    Get paginated list of ONLINE games
   * @access  Admin
   */
  getOnlineGames = asyncHandler(async (req: Request, res: Response) => {
    const result = await adminService.getOnlineGames(req.query as any);
    sendSuccess(res, result, 'Online games retrieved successfully');
  });

  /**
   * @route   GET /api/v1/admin/games/offline
   * @desc    Get paginated list of OFFLINE games
   * @access  Admin
   */
  getOfflineGames = asyncHandler(async (req: Request, res: Response) => {
    const result = await adminService.getOfflineGames(req.query as any);
    sendSuccess(res, result, 'Offline games retrieved successfully');
  });

  /**
   * @route   GET /api/v1/admin/games/:gameId
   * @desc    Get detailed game information
   * @access  Admin
   */
  getGameById = asyncHandler(async (req: Request, res: Response) => {
    const { gameId } = req.params;
    const game = await adminService.getGameById(gameId);
    sendSuccess(res, game, 'Game details retrieved successfully');
  });

  /**
   * @route   GET /api/v1/admin/stats
   * @desc    Get admin dashboard statistics
   * @access  Admin
   */
  getStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await adminService.getStats();
    sendSuccess(res, stats, 'Admin statistics retrieved successfully');
  });
}

export default new AdminController();
