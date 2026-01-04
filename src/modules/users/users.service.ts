import { User, IUser } from "../auth/auth.model";

export class UserService {
  static async getProfile(userId: string): Promise<IUser | null> {
    return User.findById(userId).select("-password -refreshToken");
  }

  static async updateProfile(userId: string, update: Partial<IUser>): Promise<IUser | null> {
    return User.findByIdAndUpdate(userId, update, { new: true }).select("-password -refreshToken");
  }

  static async listUsers(): Promise<IUser[]> {
    return User.find().select("-password -refreshToken");
  }
}
