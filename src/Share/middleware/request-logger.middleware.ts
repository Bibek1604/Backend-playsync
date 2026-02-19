import { Request, Response, NextFunction } from 'express';

/**
 * RequestLogger — structured HTTP request/response logging.
 * Logs method, path, status, user, IP, and latency.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const { method, originalUrl, ip } = req;
  const userId = (req as any).user?.id ?? 'anonymous';

  res.on('finish', () => {
    const latency = Date.now() - start;
    const level = res.statusCode >= 500 ? 'ERROR' : res.statusCode >= 400 ? 'WARN' : 'INFO';
    const log = {
      level,
      ts: new Date().toISOString(),
      method,
      path: originalUrl,
      status: res.statusCode,
      userId,
      ip,
      latencyMs: latency,
    };
    if (level === 'ERROR') {
      console.error(JSON.stringify(log));
    } else if (level === 'WARN') {
      console.warn(JSON.stringify(log));
    } else {
      console.log(JSON.stringify(log));
    }
  });

  next();
}
