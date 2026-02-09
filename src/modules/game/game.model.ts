/**
 * Game Module - Mongoose Models
 * Database schemas for games and participants
 */

import mongoose, { Document, Schema, Model } from 'mongoose';
import { GameCategory, GameStatus, ParticipantStatus } from './game.types';

// Game Participant Interface
export interface IGameParticipantDocument extends Document {
  gameId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  joinedAt: Date;
  leftAt?: Date;
  status: ParticipantStatus;
}

// Game Interface
export interface IGameDocument extends Document {
  title: string;
  description?: string;
  category: GameCategory;
  imageUrl?: string;
  imagePublicId?: string;
  maxPlayers: number;
  currentPlayers: number;
  status: GameStatus;
  creatorId: mongoose.Types.ObjectId;
  participants: IGameParticipantDocument[];
  startTime: Date;
  endTime: Date;
  endedAt?: Date;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Participant Sub-Schema
const participantSchema = new Schema<IGameParticipantDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    leftAt: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: Object.values(ParticipantStatus),
      default: ParticipantStatus.ACTIVE
    }
  },
  { _id: true }
);

// Game Schema
const gameSchema = new Schema<IGameDocument>(
  {
    title: {
      type: String,
      required: [true, 'Game title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [255, 'Title must not exceed 255 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description must not exceed 2000 characters'],
      default: ''
    },
    category: {
      type: String,
      enum: Object.values(GameCategory),
      required: [true, 'Game category is required']
    },
    imageUrl: {
      type: String,
      default: null
    },
    imagePublicId: {
      type: String,
      default: null
    },
    maxPlayers: {
      type: Number,
      required: [true, 'Maximum players is required'],
      min: [1, 'Max players must be at least 1'],
      max: [1000, 'Max players cannot exceed 1000']
    },
    currentPlayers: {
      type: Number,
      default: 0,
      min: [0, 'Current players cannot be negative']
    },
    status: {
      type: String,
      enum: Object.values(GameStatus),
      default: GameStatus.OPEN
    },
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator ID is required']
    },
    participants: {
      type: [participantSchema],
      default: []
    },
    startTime: {
      type: Date,
      default: Date.now
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required'],
      validate: {
        validator: function(this: IGameDocument, value: Date) {
          return value > this.startTime;
        },
        message: 'End time must be after start time'
      }
    },
    endedAt: {
      type: Date,
      default: null
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for performance
gameSchema.index({ status: 1 });
gameSchema.index({ creatorId: 1 });
gameSchema.index({ category: 1 });
gameSchema.index({ endTime: 1, status: 1 });
gameSchema.index({ 'participants.userId': 1 });
gameSchema.index({ title: 'text', description: 'text' }); // Text search

// Compound index for active games query
gameSchema.index({ status: 1, endTime: 1 }, { 
  partialFilterExpression: { status: { $in: [GameStatus.OPEN, GameStatus.FULL] } } 
});

// Virtual for creator population
gameSchema.virtual('creator', {
  ref: 'User',
  localField: 'creatorId',
  foreignField: '_id',
  justOne: true
});

// Pre-save middleware to validate
gameSchema.pre('save', function(next) {
  // Validate currentPlayers doesn't exceed maxPlayers
  if (this.currentPlayers > this.maxPlayers) {
    next(new Error('Current players cannot exceed max players'));
  }
  
  // Validate end time is in the future (only for new games)
  if (this.isNew && this.endTime <= new Date()) {
    next(new Error('End time must be in the future'));
  }
  
  // Auto-update status based on current players
  if (this.currentPlayers >= this.maxPlayers && this.status === GameStatus.OPEN) {
    this.status = GameStatus.FULL;
  } else if (this.currentPlayers < this.maxPlayers && this.status === GameStatus.FULL) {
    this.status = GameStatus.OPEN;
  }
  
  next();
});

// Model
const Game: Model<IGameDocument> = mongoose.model<IGameDocument>('Game', gameSchema);

export default Game;
