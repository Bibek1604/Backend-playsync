import { Request, Response, NextFunction } from 'express';
import { UserService } from './user.service';
import { apiResponse } from '../../Share/utils/apiResponse';

export class UserController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const user = await this.userService.getUserProfile(id);
            res.status(200).json(apiResponse(true, 'Profile retrieved', user));
        } catch (error) {
            next(error);
        }
    }

    async getMyProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            const user = await this.userService.getUserProfile(userId);
            res.status(200).json(apiResponse(true, 'My profile retrieved', user));
        } catch (error) {
            next(error);
        }
    }

    async updateMyProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            const avatarFile = req.file as Express.Multer.File | undefined;
            const user = await this.userService.updateProfile(userId, req.body, avatarFile);
            res.status(200).json(apiResponse(true, 'Profile updated', user));
        } catch (error) {
            next(error);
        }
    }

    async getLeaderboard(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const limit = parseInt(req.query.limit as string) || 50;
            const leaderboard = await this.userService.getLeaderboard(limit);
            res.status(200).json(apiResponse(true, 'Leaderboard retrieved', leaderboard));
        } catch (error) {
            next(error);
        }
    }
}
