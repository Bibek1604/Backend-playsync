import { Request, Response, NextFunction } from 'express';

interface BodySizeOptions {
  maxBytes: number;
  errorMessage?: string;
}

/**
 * bodySizeGuard — rejects requests with bodies exceeding maxBytes.
 * Works based on Content-Length header as a fast pre-check.
 */
export function bodySizeGuard(options: BodySizeOptions) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = Number(req.headers['content-length'] ?? 0);
    if (contentLength > options.maxBytes) {
      res.status(413).json({
        success: false,
        message: options.errorMessage ?? `Request body too large. Max ${options.maxBytes} bytes.`,
      });
      return;
    }
    next();
  };
}

/**
 * requireContentType — ensures the request uses application/json.
 */
export function requireJsonContentType(req: Request, res: Response, next: NextFunction): void {
  const methods = ['POST', 'PUT', 'PATCH'];
  if (methods.includes(req.method) && !req.is('application/json')) {
    res.status(415).json({
      success: false,
      message: 'Content-Type must be application/json.',
    });
    return;
  }
  next();
}

/**
 * sanitizeInput — strips leading/trailing whitespace from string body fields.
 */
export function sanitizeStringFields(req: Request, _res: Response, next: NextFunction): void {
  if (req.body && typeof req.body === 'object') {
    const sanitize = (obj: Record<string, unknown>): Record<string, unknown> => {
      for (const key of Object.keys(obj)) {
        if (typeof obj[key] === 'string') {
          obj[key] = (obj[key] as string).trim();
        } else if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
          sanitize(obj[key] as Record<string, unknown>);
        }
      }
      return obj;
    };
    sanitize(req.body);
  }
  next();
}
