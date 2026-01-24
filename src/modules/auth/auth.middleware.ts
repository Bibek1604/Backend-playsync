import jwt from "jsonwebtoken";
import AppError from "../../Share/utils/AppError";

export const auth = (req: any, _res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return next(new AppError("Unauthorized", 401));

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET!);
    next();
  } catch {
    next(new AppError("Invalid token", 401));
  }
};

export const authorize =
  (...roles: string[]) =>
    (req: any, _res: any, next: any) => {
      if (!roles.includes(req.user.role)) {
        return next(new AppError("Forbidden", 403));
      }
      next();
    };
