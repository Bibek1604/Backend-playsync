import { z } from "zod";

export const createProfileSchema = z.object({
  bio: z.string().optional(),
  location: z.string().optional(),
  social: z.object({
    facebook: z.string().optional(),
    twitter: z.string().optional(),
    instagram: z.string().optional(),
  }).optional(),
});

export type CreateProfileDTO = z.infer<typeof createProfileSchema>;

export const updateProfileSchema = createProfileSchema.partial();
export type UpdateProfileDTO = z.infer<typeof updateProfileSchema>;

export const updateNameSchema = z.object({ fullName: z.string().min(2, "Full name must be at least 2 characters long") });

export const resetPasswordSchema = z.object({ oldPassword: z.string().min(6), newPassword: z.string().min(6) });
