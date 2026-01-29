import Profile, { IProfile } from "./profile.model";
import { Types } from "mongoose";

export const ProfileRepository = {
  async create(data: Partial<IProfile>) {
    const doc = new Profile(data);
    return doc.save();
  },

  async findByUserId(userId: string) {
    return Profile.findOne({ userId: new Types.ObjectId(userId) }).exec();
  },

  async updateByUserId(userId: string, updateData: Partial<IProfile>, options: any = { new: true, upsert: true }) {
    return Profile.findOneAndUpdate({ userId: new Types.ObjectId(userId) }, updateData, options).exec();
  },

  async deleteByUserId(userId: string) {
    return Profile.findOneAndDelete({ userId: new Types.ObjectId(userId) }).exec();
  },

  async setAvatar(userId: string, url: string) {
    return Profile.findOneAndUpdate({ userId: new Types.ObjectId(userId) }, { avatar: url }, { new: true }).exec();
  },

  async setCoverPhoto(userId: string, url: string) {
    return Profile.findOneAndUpdate({ userId: new Types.ObjectId(userId) }, { coverPhoto: url }, { new: true }).exec();
  },

  async addPicture(userId: string, url: string) {
    return Profile.findOneAndUpdate({ userId: new Types.ObjectId(userId) }, { $push: { pictures: url } }, { new: true }).exec();
  },

  async removePicture(userId: string, url: string) {
    return Profile.findOneAndUpdate({ userId: new Types.ObjectId(userId) }, { $pull: { pictures: url } }, { new: true }).exec();
  },
};
