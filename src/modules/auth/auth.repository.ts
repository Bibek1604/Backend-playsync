import { User, IUser } from "./auth.model";

export interface IUserRepository {
  create(userData: Partial<IUser>): Promise<IUser>;
  findByEmail(email: string): Promise<IUser | null>;
  findById(id: string): Promise<IUser | null>;
}

export class UserRepository implements IUserRepository {
  async create(userData: Partial<IUser>): Promise<IUser> {
    const user = new User(userData);
    return await user.save();
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email });
  }

  async findById(id: string): Promise<IUser | null> {
    return await User.findById(id).select("-password");
  }

  async findByEmailOrRefreshToken(refreshToken: string): Promise<IUser | null> {
    return await User.findOne({ refreshToken });
  }
}