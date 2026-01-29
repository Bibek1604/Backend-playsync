"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removePictureSchema = exports.resetPasswordSchema = exports.updateNameSchema = exports.updateProfileSchema = exports.createProfileSchema = void 0;
const zod_1 = require("zod");
exports.createProfileSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).optional(),
    number: zod_1.z.string().optional(),
    favouriteGame: zod_1.z.string().optional(),
    avatar: zod_1.z.string().url().optional(),
    place: zod_1.z.string().optional(),
});
exports.updateProfileSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "Name must be at least 2 characters long").optional(),
    number: zod_1.z.string().optional(),
    place: zod_1.z.string().optional(),
    favouriteGame: zod_1.z.string().optional(),
    avatar: zod_1.z.string().url().optional(),
    currentPassword: zod_1.z.string().min(6).optional(),
    changePassword: zod_1.z.string().min(6).optional(),
});
exports.updateNameSchema = zod_1.z.object({ fullName: zod_1.z.string().min(2, "Full name must be at least 2 characters long") });
exports.resetPasswordSchema = zod_1.z.object({ oldPassword: zod_1.z.string().min(6), newPassword: zod_1.z.string().min(6) });
exports.removePictureSchema = zod_1.z.object({ url: zod_1.z.string().min(1) });
//# sourceMappingURL=profile.dto.js.map