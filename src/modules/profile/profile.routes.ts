import { Router } from "express";
import { ProfileController } from "./profile.controller";
import { auth } from "../auth/auth.middleware";
import { profilePictureUpload } from "./profile.uploader";

const router = Router();

// All routes are protected with auth middleware
router.get("/", auth, ProfileController.getProfile);

router.put(
    "/",
    auth,
    profilePictureUpload.single("profilePicture"),
    ProfileController.updateProfile
);

router.put("/change-password", auth, ProfileController.changePassword);

export default router;