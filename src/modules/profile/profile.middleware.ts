import { Request, Response, NextFunction } from "express";
import AppError from "../../Share/utils/AppError";
import { ProfileRepository } from "./profile.repository";

const profileRepository = new ProfileRepository();

export const profileExists = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await profileRepository.findByUserId((req as any).user.id);
    if (!profile) {
      return next(new AppError("Profile not found", 404));
    }
    (req as any).profile = profile;
    next();
  } catch (err) {
    next(err);
  }
};