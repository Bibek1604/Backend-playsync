import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IGameReport extends Document {
  gameId: Types.ObjectId;
  reportedBy: Types.ObjectId;
  reason: 'spam' | 'inappropriate' | 'cheating' | 'fake_location' | 'other';
  details?: string;
  status: 'pending' | 'reviewed' | 'dismissed' | 'actioned';
  reviewedBy?: Types.ObjectId;
  reviewNote?: string;
  createdAt: Date;
  reviewedAt?: Date;
}

const GameReportSchema = new Schema<IGameReport>(
  {
    gameId: { type: Schema.Types.ObjectId, ref: 'Game', required: true, index: true },
    reportedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reason: {
      type: String,
      required: true,
      enum: ['spam', 'inappropriate', 'cheating', 'fake_location', 'other'],
    },
    details: { type: String, maxlength: 500 },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'dismissed', 'actioned'],
      default: 'pending',
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewNote: { type: String },
    reviewedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

GameReportSchema.index({ gameId: 1, reportedBy: 1 }, { unique: true });

export const GameReport = mongoose.model<IGameReport>('GameReport', GameReportSchema);
