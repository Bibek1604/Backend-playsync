import { User, IUser } from "./auth.model";

export interface IUserRepository {
  create(userData: Partial<IUser>): Promise<IUser>;
  findByEmail(email: string): Promise<IUser | null>;
  findByEmailWithPassword(email: string): Promise<IUser | null>;
  findById(id: string): Promise<IUser | null>;
  findByIdWithPassword(id: string): Promise<IUser | null>;
  updateById(id: string, updateData: Partial<IUser>): Promise<IUser | null>;
}

export class UserRepository implements IUserRepository {
  async create(userData: Partial<IUser>): Promise<IUser> {
    const user = new User(userData);
    return await user.save();
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email });
  }

  async findByEmailWithPassword(email: string): Promise<IUser | null> {
    return await User.findOne({ email }).select("+password");
  }

  async findById(id: string): Promise<IUser | null> {
    return await User.findById(id).select("-password");
  }

  async findByIdWithPassword(id: string): Promise<IUser | null> {
    return await User.findById(id).select("+password");
  }

  async updateById(
    id: string,
    updateData: Partial<IUser>
  ): Promise<IUser | null> {
    return await User.findByIdAndUpdate(id, updateData, { new: true });
  }

  async findByEmailOrRefreshToken(refreshToken: string): Promise<IUser | null> {
    return await User.findOne({ refreshToken });
  }
}