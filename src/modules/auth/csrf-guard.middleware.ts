import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

const CSRF_HEADER = 'x-csrf-token';
const CSRF_COOKIE = 'csrf_token';
const TOKEN_BYTES = 32;
const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

interface CsrfEntry {
  token: string;
  createdAt: number;
}

const tokenStore = new Map<string, CsrfEntry>();

export function generateCsrfToken(sessionId: string): string {
  const token = crypto.randomBytes(TOKEN_BYTES).toString('hex');
  tokenStore.set(sessionId, { token, createdAt: Date.now() });
  return token;
}

export function csrfGuard(req: Request, res: Response, next: NextFunction): void {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    next();
    return;
  }

  const sessionId = (req as any).user?.id ?? req.ip ?? '';
  const incomingToken = req.headers[CSRF_HEADER] as string | undefined;
  const expected = tokenStore.get(sessionId);

  if (!incomingToken || !expected) {
    res.status(403).json({ success: false, message: 'CSRF token missing.' });
    return;
  }

  const expired = Date.now() - expected.createdAt > TOKEN_TTL_MS;
  const mismatch = !crypto.timingSafeEqual(
    Buffer.from(incomingToken),
    Buffer.from(expected.token)
  );

  if (expired || mismatch) {
    tokenStore.delete(sessionId);
    res.status(403).json({ success: false, message: 'CSRF token invalid or expired.' });
    return;
  }

  // Rotate on successful use
  const newToken = generateCsrfToken(sessionId);
  res.cookie(CSRF_COOKIE, newToken, { httpOnly: false, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' });
  next();
}
