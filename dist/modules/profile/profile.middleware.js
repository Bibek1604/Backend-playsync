"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureProfile = void 0;
const profile_repository_1 = require("./profile.repository");
const AppError_1 = __importDefault(require("../../Share/utils/AppError"));
const ensureProfile = async (req, _res, next) => {
    const userId = req.user?.id;
    if (!userId)
        return next(new AppError_1.default("Unauthorized", 401));
    const profile = await profile_repository_1.ProfileRepository.findByUserId(userId);
    if (!profile)
        return next(new AppError_1.default("Profile not found", 404));
    req.profile = profile;
    next();
};
exports.ensureProfile = ensureProfile;
//# sourceMappingURL=profile.middleware.js.map