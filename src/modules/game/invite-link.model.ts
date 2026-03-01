import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IInviteLink extends Document {
  gameId: Types.ObjectId;
  createdBy: Types.ObjectId;
  inviteCode: string;
  expiresAt: Date;
  isActive: boolean;
  createdAt: Date;
}

const InviteLinkSchema = new Schema<IInviteLink>(
  {
    gameId: { type: Schema.Types.ObjectId, ref: 'Game', required: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    inviteCode: { type: String, required: true, unique: true, index: true },
    expiresAt: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Auto-expire documents after expiresAt
InviteLinkSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const InviteLink = mongoose.model<IInviteLink>('InviteLink', InviteLinkSchema);
