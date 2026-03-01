import mongoose, { Schema, Document, Types } from 'mongoose';

export type WaitlistStatus = 'waiting' | 'promoted' | 'expired' | 'cancelled';

export interface IGameWaitlist extends Document {
  gameId: Types.ObjectId;
  userId: Types.ObjectId;
  position: number;
  status: WaitlistStatus;
  notifiedAt?: Date;
  expiresAt: Date;
  createdAt: Date;
}

const GameWaitlistSchema = new Schema<IGameWaitlist>(
  {
    gameId: { type: Schema.Types.ObjectId, ref: 'Game', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    position: { type: Number, required: true },
    status: { type: String, enum: ['waiting', 'promoted', 'expired', 'cancelled'], default: 'waiting' },
    notifiedAt: { type: Date },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

GameWaitlistSchema.index({ gameId: 1, userId: 1 }, { unique: true });
GameWaitlistSchema.index({ gameId: 1, position: 1 });
GameWaitlistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export async function getNextWaitlistPosition(gameId: string): Promise<number> {
  const last = await GameWaitlistModel.findOne({ gameId, status: 'waiting' })
    .sort({ position: -1 })
    .select('position')
    .lean();
  return (last?.position ?? 0) + 1;
}

export const GameWaitlistModel = mongoose.model<IGameWaitlist>('GameWaitlist', GameWaitlistSchema);
