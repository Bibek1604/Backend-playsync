import { Profile, IProfile } from "./profile.model";

export interface IProfileRepository {
  create(profileData: Partial<IProfile>): Promise<IProfile>;
  findByUserId(userId: string): Promise<IProfile | null>;
  updateByUserId(userId: string, updateData: Partial<IProfile>): Promise<IProfile | null>;
  deleteByUserId(userId: string): Promise<boolean>;
}

export class ProfileRepository implements IProfileRepository {
  async create(profileData: Partial<IProfile>): Promise<IProfile> {
    const profile = new Profile(profileData);
    return await profile.save();
  }

  async findByUserId(userId: string): Promise<IProfile | null> {
    return await Profile.findOne({ userId });
  }

  async updateByUserId(userId: string, updateData: Partial<IProfile>): Promise<IProfile | null> {
    return await Profile.findOneAndUpdate({ userId }, updateData, { new: true });
  }

  async deleteByUserId(userId: string): Promise<boolean> {
    const result = await Profile.findOneAndDelete({ userId });
    return !!result;
  }
}