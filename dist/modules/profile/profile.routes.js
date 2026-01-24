"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const profile_controller_1 = require("./profile.controller");
const validateDto_1 = __importDefault(require("../../Share/utils/validateDto"));
const auth_middleware_1 = require("../auth/auth.middleware");
const zod_1 = require("zod");
const createProfileSchema = zod_1.z.object({
    bio: zod_1.z.string().max(500).optional(),
    avatar: zod_1.z.string().url().optional(),
    location: zod_1.z.string().optional(),
    website: zod_1.z.string().url().optional(),
    favoriteGame: zod_1.z.string().optional(),
    socialLinks: zod_1.z.object({
        twitter: zod_1.z.string().url().optional(),
        linkedin: zod_1.z.string().url().optional(),
        github: zod_1.z.string().url().optional(),
    }).optional(),
});
const updateProfileSchema = zod_1.z.object({
    bio: zod_1.z.string().max(500).optional(),
    avatar: zod_1.z.string().url().optional(),
    location: zod_1.z.string().optional(),
    website: zod_1.z.string().url().optional(),
    favoriteGame: zod_1.z.string().optional(),
    socialLinks: zod_1.z.object({
        twitter: zod_1.z.string().url().optional(),
        linkedin: zod_1.z.string().url().optional(),
        github: zod_1.z.string().url().optional(),
    }).optional(),
});
const updateNameSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2),
});
const resetPasswordSchema = zod_1.z.object({
    oldPassword: zod_1.z.string().min(8),
    newPassword: zod_1.z.string().min(8),
});
const router = (0, express_1.Router)();
router.use(auth_middleware_1.auth);
router.post("/", (0, validateDto_1.default)(createProfileSchema), profile_controller_1.ProfileController.createProfile);
router.get("/", profile_controller_1.ProfileController.getProfile);
router.put("/", (0, validateDto_1.default)(updateProfileSchema), profile_controller_1.ProfileController.updateProfile);
router.patch("/name", (0, validateDto_1.default)(updateNameSchema), profile_controller_1.ProfileController.updateName);
router.patch("/reset-password", (0, validateDto_1.default)(resetPasswordSchema), profile_controller_1.ProfileController.resetPassword);
router.delete("/", profile_controller_1.ProfileController.deleteProfile);
exports.default = router;
//# sourceMappingURL=profile.routes.js.map