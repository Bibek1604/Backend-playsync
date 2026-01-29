import { Router } from "express";
import { ProfileController } from "./profile.controller";
import { auth } from "../auth/auth.middleware";
import validateDto from "../../Share/utils/validateDto";
import { createProfileSchema, updateProfileSchema, updateNameSchema, resetPasswordSchema } from "./profile.dto";

const router = Router();

router.post("/", auth, validateDto(createProfileSchema), ProfileController.createProfile);
router.get("/", auth, ProfileController.getProfile);
router.put("/", auth, validateDto(updateProfileSchema), ProfileController.updateProfile);
router.patch("/name", auth, validateDto(updateNameSchema), ProfileController.updateName);
router.patch("/reset-password", auth, validateDto(resetPasswordSchema), ProfileController.resetPassword);
router.delete("/", auth, ProfileController.deleteProfile);

export default router;
