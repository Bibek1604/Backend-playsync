import { Request, Response, NextFunction } from 'express';

export interface RateLimiterOptions {
  windowMs: number;
  maxRequests: number;
  blockDurationMs?: number;
  keyExtractor?: (req: Request) => string;
  errorMessage?: string;
}

/**
 * Rate limiting is DISABLED for development.
 * All limiters are pass-through no-ops.
 */
export function createRateLimiter(_options: RateLimiterOptions) {
  return (_req: Request, _res: Response, next: NextFunction): void => {
    next();
  };
}

// Pre-configured limiters (kept as no-ops so imports don't break)
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 999,
});

export const registerRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  maxRequests: 999,
});

export const passwordResetRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  maxRequests: 999,
});

