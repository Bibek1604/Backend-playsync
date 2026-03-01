/**
 * Notification preference schema persisted per user.
 * Allows users to opt out of specific notification types.
 */
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IUserNotificationPrefs extends Document {
  userId: Types.ObjectId;
  gameInvites: boolean;
  gameStarting: boolean;
  playerJoined: boolean;
  chatMessages: boolean;
  badgeEarned: boolean;
  marketing: boolean;
  pushEnabled: boolean;
  emailEnabled: boolean;
  updatedAt: Date;
}

const UserNotificationPrefsSchema = new Schema<IUserNotificationPrefs>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    gameInvites: { type: Boolean, default: true },
    gameStarting: { type: Boolean, default: true },
    playerJoined: { type: Boolean, default: true },
    chatMessages: { type: Boolean, default: true },
    badgeEarned: { type: Boolean, default: true },
    marketing: { type: Boolean, default: false },
    pushEnabled: { type: Boolean, default: true },
    emailEnabled: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

export const UserNotificationPrefs = mongoose.model<IUserNotificationPrefs>(
  'UserNotificationPrefs',
  UserNotificationPrefsSchema
);

export async function getUserPrefs(userId: string): Promise<IUserNotificationPrefs> {
  const existing = await UserNotificationPrefs.findOne({ userId });
  if (existing) return existing;
  return UserNotificationPrefs.create({ userId });
}
