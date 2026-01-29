import mongoose, { Document, Schema, Types } from "mongoose";

export interface IProfile extends Document {
  userId: Types.ObjectId;
  bio?: string;
  number?: string;
  favouriteGame?: string;
  avatar?: string;
  coverPhoto?: string;
  pictures: string[];
  place?: string;

  social?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const ProfileSchema = new Schema<IProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    bio: { type: String },
    number: { type: String },
    favouriteGame: { type: String },
    avatar: { type: String },
    coverPhoto: { type: String },
    pictures: { type: [String], default: [] },
    place: { type: String },

    social: {
      facebook: { type: String },
      twitter: { type: String },
      instagram: { type: String },
    },
  },
  { timestamps: true }
);

export default mongoose.model<IProfile>("Profile", ProfileSchema);