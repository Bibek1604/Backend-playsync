import mongoose, { Document, Schema, Types } from "mongoose";

export interface IProfile extends Document {
  userId: Types.ObjectId;
  number?: string;
  favouriteGame?: string;
  avatar?: string;
  coverPhoto?: string;
  pictures: string[];
  place?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const ProfileSchema = new Schema<IProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    number: { type: String },
    favouriteGame: { type: String },
    avatar: { type: String },
    coverPhoto: { type: String },
    pictures: { type: [String], default: [] },
    place: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IProfile>("Profile", ProfileSchema);