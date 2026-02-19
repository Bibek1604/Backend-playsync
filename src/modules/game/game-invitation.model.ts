import mongoose, { Schema, Document, Types } from 'mongoose';

export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired';

export interface IGameInvitation extends Document {
  gameId: Types.ObjectId;
  invitedBy: Types.ObjectId;
  invitedUser: Types.ObjectId;
  status: InvitationStatus;
  message?: string;
  expiresAt: Date;
  respondedAt?: Date;
  createdAt: Date;
}

const GameInvitationSchema = new Schema<IGameInvitation>(
  {
    gameId: { type: Schema.Types.ObjectId, ref: 'Game', required: true, index: true },
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    invitedUser: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'expired'],
      default: 'pending',
    },
    message: { type: String, maxlength: 200 },
    expiresAt: { type: Date, required: true },
    respondedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

GameInvitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
GameInvitationSchema.index({ gameId: 1, invitedUser: 1 }, { unique: true });

export const GameInvitation = mongoose.model<IGameInvitation>('GameInvitation', GameInvitationSchema);
