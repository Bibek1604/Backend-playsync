class AppError extends Error {
  public statusCode: number;
  public errorCode: string;
  public data?: any;

  constructor(message: string, statusCode: number, errorCode: string = 'INTERNAL_ERROR', data?: any) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.data = data;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;