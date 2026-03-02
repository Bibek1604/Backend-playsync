/**
 * Tournament Message Model
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface ITournamentMessageDocument extends Document {
  tournamentId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
}

const tournamentMessageSchema = new Schema<ITournamentMessageDocument>(
  {
    tournamentId: { type: Schema.Types.ObjectId, ref: 'Tournament', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, trim: true, maxlength: 1500 },
  },
  { timestamps: true }
);

tournamentMessageSchema.index({ tournamentId: 1, createdAt: 1 });

export const TournamentMessage = mongoose.model<ITournamentMessageDocument>(
  'TournamentMessage',
  tournamentMessageSchema
);
