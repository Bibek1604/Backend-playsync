import { ZodObject, ZodError } from "zod";
import { Request, Response, NextFunction } from "express";
import { AppError } from "./appError";

export const validateDto =
  (schema: ZodObject<any>) =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (err: any) {
      console.error("Validation error:", err);
      if (err instanceof ZodError && Array.isArray(err.errors) && err.errors.length > 0) {
        const errorMsg = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(", ");
        next(new AppError(errorMsg, 400));
      } else {
        next(new AppError("Invalid request data", 400));
      }
    }
  };
