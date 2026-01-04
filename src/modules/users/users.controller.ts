import { Request, Response, NextFunction } from "express";

interface AuthRequest extends Request {
  user: { id: string; role: string };
}
import { UserService } from "./users.service";

export class UserController {
  static async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await UserService.getProfile(req.user.id);
      res.status(200).json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  }

  static async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await UserService.updateProfile(req.user.id, req.body);
      res.status(200).json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  }

  static async listUsers(_req: Request, res: Response, next: NextFunction) {
    try {
      const users = await UserService.listUsers();
      res.status(200).json({ success: true, data: users });
    } catch (err) {
      next(err);
    }
  }
}
