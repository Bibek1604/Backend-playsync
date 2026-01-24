export interface CreateProfileDTO {
  bio?: string;
  avatar?: string;
  location?: string;
  website?: string;
  favoriteGame?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

export interface UpdateProfileDTO {
  bio?: string;
  avatar?: string;
  location?: string;
  website?: string;
  favoriteGame?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

export interface UpdateNameDTO {
  fullName: string;
}

export interface PasswordResetDTO {
  oldPassword: string;
  newPassword: string;
}

export interface ProfileResponseDTO {
  id: string;
  userId: string;
  fullName?: string;
  email?: string;
  bio?: string;
  avatar?: string;
  location?: string;
  website?: string;
  favoriteGame?: string;
  lastJoined?: Date;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}