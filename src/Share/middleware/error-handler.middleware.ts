import { Request, Response, NextFunction } from 'express';

/**
 * globalErrorHandler — catches all unhandled errors and returns a uniform JSON response.
 * Must be the LAST middleware registered on the app.
 */
export function globalErrorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const status = err.status ?? err.statusCode ?? 500;
  const message = err.isOperational
    ? err.message
    : 'An unexpected error occurred. Please try again later.';

  // Log internal errors
  if (status >= 500) {
    console.error('[UNHANDLED_ERROR]', {
      message: err.message,
      stack: err.stack,
      path: req.originalUrl,
      method: req.method,
    });
  }

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' ? { stack: err.stack } : {}),
  });
}

/**
 * notFoundHandler — catches all unmatched routes.
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });
}

/**
 * AppError — operational error class with HTTP status.
 */
export class AppError extends Error {
  public readonly isOperational = true;

  constructor(
    public readonly message: string,
    public readonly status: number = 500
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }

  static badRequest(msg: string) { return new AppError(msg, 400); }
  static unauthorized(msg = 'Unauthorized') { return new AppError(msg, 401); }
  static forbidden(msg = 'Forbidden') { return new AppError(msg, 403); }
  static notFound(msg = 'Not found') { return new AppError(msg, 404); }
  static conflict(msg: string) { return new AppError(msg, 409); }
}
