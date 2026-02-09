"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const profile_controller_1 = require("./profile.controller");
const auth_middleware_1 = require("../auth/auth.middleware");
const profile_uploader_1 = require("./profile.uploader");
const router = (0, express_1.Router)();
router.get("/", auth_middleware_1.auth, profile_controller_1.ProfileController.getProfile);
router.put("/", auth_middleware_1.auth, profile_uploader_1.profilePictureUpload.single("profilePicture"), profile_controller_1.ProfileController.updateProfile);
router.put("/change-password", auth_middleware_1.auth, profile_controller_1.ProfileController.changePassword);
exports.default = router;
//# sourceMappingURL=profile.routes.js.map