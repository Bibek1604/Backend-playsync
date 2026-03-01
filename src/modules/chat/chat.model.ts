/**
 * Chat Module - Mongoose Model
 * Persistent chat messages for game rooms
 */

import mongoose, { Document, Schema, Model } from 'mongoose';

export enum MessageType {
  TEXT = 'text',
  SYSTEM = 'system'
}

export interface IChatMessageDocument extends Document {
  game: mongoose.Types.ObjectId;
  user?: mongoose.Types.ObjectId;
  content: string;
  type: MessageType;
  createdAt: Date;
  updatedAt: Date;
}

const chatMessageSchema = new Schema<IChatMessageDocument>(
  {
    game: {
      type: Schema.Types.ObjectId,
      ref: 'Game',
      required: [true, 'Game ID is required'],
      index: true
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
      maxlength: [1500, 'Message cannot exceed 1500 characters'],
      minlength: [1, 'Message cannot be empty']
    },
    type: {
      type: String,
      enum: Object.values(MessageType),
      default: MessageType.TEXT
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for efficient queries
chatMessageSchema.index({ game: 1, createdAt: -1 }); // Chat history (newest first)
chatMessageSchema.index({ game: 1, createdAt: 1 });  // Alternative for oldest first
chatMessageSchema.index({ game: 1, type: 1 });       // Filter by message type

// Prevent chat messages for non-existent games (optional validation)
chatMessageSchema.pre('save', async function() {
  if (this.isNew) {
    const Game = mongoose.model('Game');
    const gameExists = await Game.exists({ _id: this.game });
    if (!gameExists) {
      throw new Error('Cannot save message for non-existent game');
    }
  }
});

const ChatMessage: Model<IChatMessageDocument> = mongoose.model<IChatMessageDocument>(
  'ChatMessage',
  chatMessageSchema
);

export default ChatMessage;
