import { z } from "zod";

export const createProfileSchema = z.object({
  name: z.string().min(2).optional(),
  bio: z.string().optional(),
  number: z.string().optional(),
  favouriteGame: z.string().optional(),
  avatar: z.string().url().optional(),
  place: z.string().optional(),
  social: z.object({
    facebook: z.string().optional(),
    twitter: z.string().optional(),
    instagram: z.string().optional(),
  }).optional(),
});


export type CreateProfileDTO = z.infer<typeof createProfileSchema>;

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long").optional(),
  number: z.string().optional(),
  place: z.string().optional(),
  favouriteGame: z.string().optional(),
  currentPassword: z.string().min(6).optional(),
  changePassword: z.string().min(6).optional(),
});
export type UpdateProfileDTO = z.infer<typeof updateProfileSchema>;


export const updateNameSchema = z.object({ fullName: z.string().min(2, "Full name must be at least 2 characters long") });

export const resetPasswordSchema = z.object({ oldPassword: z.string().min(6), newPassword: z.string().min(6) });

export const removePictureSchema = z.object({ url: z.string().min(1) });