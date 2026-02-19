import { Request, Response, NextFunction } from 'express';

interface RequestContext {
  requestId: string;
  startTime: number;
  userId?: string;
  ip: string;
}

const contextsMap = new WeakMap<Request, RequestContext>();

export function attachRequestContext(req: Request, res: Response, next: NextFunction): void {
  const requestId = req.headers['x-request-id'] as string
    ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const ctx: RequestContext = {
    requestId,
    startTime: Date.now(),
    ip: req.ip ?? 'unknown',
  };

  contextsMap.set(req, ctx);
  res.setHeader('X-Request-ID', requestId);
  next();
}

export function getContext(req: Request): RequestContext | undefined {
  return contextsMap.get(req);
}

export function setUserId(req: Request, userId: string): void {
  const ctx = contextsMap.get(req);
  if (ctx) ctx.userId = userId;
}
