import mongoose, { Document, Schema } from "mongoose";

export interface IProfile extends Document {
  userId: mongoose.Types.ObjectId;
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
  createdAt: Date;
  updatedAt: Date;
}

const profileSchema = new Schema<IProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    bio: {
      type: String,
      maxlength: [500, "Bio must be less than 500 characters"],
    },
    avatar: {
      type: String,
    },
    location: {
      type: String,
    },
    website: {
      type: String,
    },
    favoriteGame: {
      type: String,
    },
    socialLinks: {
      twitter: String,
      linkedin: String,
      github: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Profile = mongoose.model<IProfile>("Profile", profileSchema);