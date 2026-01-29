"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const profile_controller_1 = require("./profile.controller");
const auth_middleware_1 = require("../auth/auth.middleware");
const validateDto_1 = __importDefault(require("../../Share/utils/validateDto"));
const profile_dto_1 = require("./profile.dto");
const profile_uploader_1 = require("./profile.uploader");
const router = (0, express_1.Router)();
router.post("/", auth_middleware_1.auth, (0, validateDto_1.default)(profile_dto_1.createProfileSchema), profile_controller_1.ProfileController.createProfile);
router.get("/", auth_middleware_1.auth, profile_controller_1.ProfileController.getProfile);
router.put("/", auth_middleware_1.auth, (0, validateDto_1.default)(profile_dto_1.updateProfileSchema), profile_controller_1.ProfileController.updateProfile);
router.patch("/name", auth_middleware_1.auth, (0, validateDto_1.default)(profile_dto_1.updateNameSchema), profile_controller_1.ProfileController.updateName);
router.patch("/reset-password", auth_middleware_1.auth, (0, validateDto_1.default)(profile_dto_1.resetPasswordSchema), profile_controller_1.ProfileController.resetPassword);
router.delete("/", auth_middleware_1.auth, profile_controller_1.ProfileController.deleteProfile);
router.post("/avatar", auth_middleware_1.auth, profile_uploader_1.avatarUpload.single("file"), profile_controller_1.ProfileController.uploadAvatar);
router.post("/cover", auth_middleware_1.auth, profile_uploader_1.coverUpload.single("file"), profile_controller_1.ProfileController.uploadCoverPhoto);
router.post("/pictures", auth_middleware_1.auth, profile_uploader_1.picturesUpload.array("files", 10), profile_controller_1.ProfileController.addPictures);
router.delete("/pictures", auth_middleware_1.auth, (0, validateDto_1.default)(profile_dto_1.removePictureSchema), profile_controller_1.ProfileController.removePicture);
exports.default = router;
//# sourceMappingURL=profile.routes.js.map