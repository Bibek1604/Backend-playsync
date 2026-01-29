"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccess = sendSuccess;
exports.sendError = sendError;
const isProd = process.env.NODE_ENV === 'production';
function sendSuccess(res, data, message = 'Success', status = 200, meta = null) {
    const response = {
        success: true,
        message,
        data,
        meta,
    };
    res.status(status).json(response);
}
function sendError(res, message, status = 400, code = 'ERROR', details = null) {
    const safeDetails = isProd ? null : details;
    const response = {
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
//# sourceMappingURL=apiResponse.js.map