import { Request, Response, NextFunction } from "express";
import { ProfileRepository } from "./profile.repository";
import AppError from "../../Share/utils/AppError";

export const ensureProfile = async (req: any, _res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  if (!userId) return next(new AppError("Unauthorized", 401));
  const profile = await ProfileRepository.findByUserId(userId);
  if (!profile) return next(new AppError("Profile not found", 404));
  req.profile = profile;
  next();
};
