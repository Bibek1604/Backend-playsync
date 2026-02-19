import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IDeviceToken extends Document {
  userId: Types.ObjectId;
  token: string;
  platform: 'android' | 'ios' | 'web';
  deviceId?: string;
  appVersion?: string;
  isActive: boolean;
  lastSeenAt: Date;
  createdAt: Date;
}

const DeviceTokenSchema = new Schema<IDeviceToken>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    token: { type: String, required: true, unique: true },
    platform: { type: String, enum: ['android', 'ios', 'web'], required: true },
    deviceId: { type: String },
    appVersion: { type: String },
    isActive: { type: Boolean, default: true },
    lastSeenAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

DeviceTokenSchema.index({ userId: 1, platform: 1 });

export const DeviceToken = mongoose.model<IDeviceToken>('DeviceToken', DeviceTokenSchema);

export class DeviceTokenRepository {
  static async upsert(userId: string, token: string, platform: IDeviceToken['platform'], meta?: Partial<IDeviceToken>): Promise<void> {
    await DeviceToken.findOneAndUpdate(
      { token },
      { userId, platform, isActive: true, lastSeenAt: new Date(), ...meta },
      { upsert: true, new: true }
    );
  }

  static async getActiveTokens(userId: string): Promise<string[]> {
    const docs = await DeviceToken.find({ userId, isActive: true }).select('token').lean();
    return docs.map((d) => d.token);
  }

  static async deactivate(token: string): Promise<void> {
    await DeviceToken.updateOne({ token }, { isActive: false });
  }
}
