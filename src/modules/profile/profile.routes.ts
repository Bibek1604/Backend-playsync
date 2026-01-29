import { Router } from "express";
import { ProfileController } from "./profile.controller";
import { auth } from "../auth/auth.middleware";
import validateDto from "../../Share/utils/validateDto";
import { createProfileSchema, updateProfileSchema, updateNameSchema, resetPasswordSchema, removePictureSchema } from "./profile.dto";
import { avatarUpload, coverUpload, picturesUpload } from "./profile.uploader";

const router = Router();

router.post("/", auth, validateDto(createProfileSchema), ProfileController.createProfile);
router.get("/", auth, ProfileController.getProfile);
router.put("/", auth, validateDto(updateProfileSchema), ProfileController.updateProfile);
router.patch("/name", auth, validateDto(updateNameSchema), ProfileController.updateName);
router.patch("/reset-password", auth, validateDto(resetPasswordSchema), ProfileController.resetPassword);
router.delete("/", auth, ProfileController.deleteProfile);

// Upload endpoints
router.post("/avatar", auth, avatarUpload.single("file"), ProfileController.uploadAvatar);
router.post("/cover", auth, coverUpload.single("file"), ProfileController.uploadCoverPhoto);
router.post("/pictures", auth, picturesUpload.array("files", 10), ProfileController.addPictures);
router.delete("/pictures", auth, validateDto(removePictureSchema), ProfileController.removePicture);

export default router;