import { Router } from "express";
import { ProfileController } from "./profile.controller";
import validateDto from "../../Share/utils/validateDto";
import { auth } from "../auth/auth.middleware";
import { z } from "zod";

const createProfileSchema = z.object({
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
  location: z.string().optional(),
  website: z.string().url().optional(),
  favoriteGame: z.string().optional(),
  socialLinks: z.object({
    twitter: z.string().url().optional(),
    linkedin: z.string().url().optional(),
    github: z.string().url().optional(),
  }).optional(),
});

const updateProfileSchema = z.object({
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
  location: z.string().optional(),
  website: z.string().url().optional(),
  favoriteGame: z.string().optional(),
  socialLinks: z.object({
    twitter: z.string().url().optional(),
    linkedin: z.string().url().optional(),
    github: z.string().url().optional(),
  }).optional(),
});

const updateNameSchema = z.object({
  fullName: z.string().min(2),
});

const resetPasswordSchema = z.object({
  oldPassword: z.string().min(8),
  newPassword: z.string().min(8),
});

const router = Router();

router.use(auth); // Require authentication for all profile routes

router.post(
  "/",
  validateDto(createProfileSchema),
  ProfileController.createProfile
);

router.get(
  "/",
  ProfileController.getProfile
);

router.put(
  "/",
  validateDto(updateProfileSchema),
  ProfileController.updateProfile
);

router.patch(
  "/name",
  validateDto(updateNameSchema),
  ProfileController.updateName
);

router.patch(
  "/reset-password",
  validateDto(resetPasswordSchema),
  ProfileController.resetPassword
);

router.delete(
  "/",
  ProfileController.deleteProfile
);

export default router;