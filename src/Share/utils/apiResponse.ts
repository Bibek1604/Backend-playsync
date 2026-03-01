import { Response } from 'express';

const isProd = process.env.NODE_ENV === 'production';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  meta?: any; 
  error?: { code: string; details: any };
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = 'Success',
  status = 200,
  meta: any = null
): void {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    meta,
  };

  res.status(status).json(response);
}

export function sendError(
  res: Response,
  message: string,
  status = 400,
  code = 'ERROR',
  details: any = null
): void {
  const safeDetails = isProd ? null : details;

  const response: ApiResponse<null> = {
    success: false,
    message,
    data: null,
    meta: null,
    error: {
      code,
      details: safeDetails,
    },
  };

  res.status(status).json(response);
}

/**
 * Helper function to create standard API response
 */
export function apiResponse<T = any>(
  success: boolean,
  message: string,
  data: T | null = null,
  meta: any = null
) {
  const response: any = {
    success,
    message
  };

  if (data !== null) {
    response.data = data;
  }

  if (meta !== null) {
    response.meta = meta;
  }

  return response;
}