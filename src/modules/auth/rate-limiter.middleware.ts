import { Request, Response, NextFunction } from 'express';

interface RateLimitEntry {
  count: number;
  windowStart: number;
  blockedUntil?: number;
}

const store = new Map<string, RateLimitEntry>();

export interface RateLimiterOptions {
  windowMs: number;
  maxRequests: number;
  blockDurationMs?: number;
  keyExtractor?: (req: Request) => string;
  errorMessage?: string;
}

export function createRateLimiter(options: RateLimiterOptions) {
  const {
    windowMs,
    maxRequests,
    blockDurationMs = windowMs * 2,
    keyExtractor = (req) => req.ip ?? 'unknown',
    errorMessage = 'Too many requests. Please try again later.',
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = keyExtractor(req);
    const now = Date.now();
    let entry = store.get(key);

    if (entry?.blockedUntil && now < entry.blockedUntil) {
      const retryAfter = Math.ceil((entry.blockedUntil - now) / 1000);
      res.set('Retry-After', String(retryAfter));
      res.status(429).json({ success: false, message: errorMessage, retryAfter });
      return;
    }

    if (!entry || now - entry.windowStart > windowMs) {
      entry = { count: 1, windowStart: now };
    } else {
      entry.count += 1;
    }

    if (entry.count > maxRequests) {
      entry.blockedUntil = now + blockDurationMs;
      store.set(key, entry);
      const retryAfter = Math.ceil(blockDurationMs / 1000);
      res.set('Retry-After', String(retryAfter));
      res.status(429).json({ success: false, message: errorMessage, retryAfter });
      return;
    }

    store.set(key, entry);
    res.set('X-RateLimit-Limit', String(maxRequests));
    res.set('X-RateLimit-Remaining', String(maxRequests - entry.count));
    next();
  };
}

// Pre-configured limiters
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,  // 15 min
  maxRequests: 10,
  blockDurationMs: 30 * 60 * 1000,  // block 30 min after burst
  errorMessage: 'Too many login attempts. Your IP has been temporarily blocked.',
});

export const registerRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,  // 1 hour
  maxRequests: 5,
  errorMessage: 'Too many registration attempts from this IP.',
});

export const passwordResetRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  maxRequests: 3,
  keyExtractor: (req) => req.body?.email ?? req.ip ?? 'unknown',
  errorMessage: 'Too many password reset requests.',
});
