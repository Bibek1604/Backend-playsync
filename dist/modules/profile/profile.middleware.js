"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileExists = void 0;
const AppError_1 = __importDefault(require("../../share/utils/AppError"));
const profile_repository_1 = require("./profile.repository");
const profileRepository = new profile_repository_1.ProfileRepository();
const profileExists = async (req, res, next) => {
    try {
        const profile = await profileRepository.findByUserId(req.user.id);
        if (!profile) {
            return next(new AppError_1.default("Profile not found", 404));
        }
        req.profile = profile;
        next();
    }
    catch (err) {
        next(err);
    }
};
exports.profileExists = profileExists;
//# sourceMappingURL=profile.middleware.js.map