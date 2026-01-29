"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AppError extends Error {
    constructor(message, statusCode, errorCode = 'INTERNAL_ERROR', data) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.data = data;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.default = AppError;
//# sourceMappingURL=AppError.js.map