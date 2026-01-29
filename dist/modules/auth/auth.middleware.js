"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.auth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AppError_1 = __importDefault(require("../../Share/utils/AppError"));
const auth = (req, _res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
        return next(new AppError_1.default("Unauthorized", 401));
    try {
        req.user = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        next();
    }
    catch {
        next(new AppError_1.default("Invalid token", 401));
    }
};
exports.auth = auth;
const authorize = (...roles) => (req, _res, next) => {
    if (!roles.includes(req.user.role)) {
        return next(new AppError_1.default("Forbidden", 403));
    }
    next();
};
exports.authorize = authorize;
//# sourceMappingURL=auth.middleware.js.map