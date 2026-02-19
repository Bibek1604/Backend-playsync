import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IRefreshToken extends Document {
  userId: Types.ObjectId;
  token: string;
  deviceInfo?: string;
  ipAddress?: string;
  expiresAt: Date;
  revokedAt?: Date;
  createdAt: Date;
}

const RefreshTokenSchema = new Schema<IRefreshToken>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    token: { type: String, required: true, unique: true },
    deviceInfo: { type: String },
    ipAddress: { type: String },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const RefreshTokenModel = mongoose.model<IRefreshToken>('RefreshToken', RefreshTokenSchema);

export class RefreshTokenRepository {
  static async save(
    userId: string,
    token: string,
    expiresAt: Date,
    meta?: { deviceInfo?: string; ipAddress?: string }
  ): Promise<void> {
    await RefreshTokenModel.create({ userId, token, expiresAt, ...meta });
  }

  static async find(token: string): Promise<IRefreshToken | null> {
    return RefreshTokenModel.findOne({ token, revokedAt: null });
  }

  static async revoke(token: string): Promise<void> {
    await RefreshTokenModel.updateOne({ token }, { revokedAt: new Date() });
  }

  static async revokeAll(userId: string): Promise<void> {
    await RefreshTokenModel.updateMany(
      { userId, revokedAt: null },
      { revokedAt: new Date() }
    );
  }

  static async listActive(userId: string): Promise<IRefreshToken[]> {
    return RefreshTokenModel.find({
      userId,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    });
  }
}
