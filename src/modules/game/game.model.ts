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
  tags: string[];
  imageUrl?: string;
  imagePublicId?: string;
  maxPlayers: number;
  minPlayers: number;
  currentPlayers: number;
  status: GameStatus;
  creatorId: mongoose.Types.ObjectId;
  participants: IGameParticipantDocument[];
  bannedUsers: mongoose.Types.ObjectId[];
  startTime: Date;
  endTime: Date;
  endedAt?: Date;
  cancelledAt?: Date;
  completedAt?: Date;
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
    tags: {
      type: [String],
      required: [true, 'At least one tag is required'],
      validate: {
        validator: function(tags: string[]) {
          return tags && tags.length >= 1 && tags.length <= 10;
        },
        message: 'Game must have between 1 and 10 tags'
      },
      set: function(tags: string[]) {
        // Normalize tags: lowercase, trim, and remove duplicates
        return [...new Set(tags.map(tag => tag.toLowerCase().trim()))];
      }
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
    minPlayers: {
      type: Number,
      default: 2,
      min: [1, 'Min players must be at least 1'],
      validate: {
        validator: function(value: number) {
          const doc = this as IGameDocument;
          return value <= doc.maxPlayers;
        },
        message: 'Min players cannot exceed max players'
      }
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
    bannedUsers: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
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
        validator: function(value: Date) {
          const doc = this as IGameDocument;
          return value > doc.startTime;
        },
        message: 'End time must be after start time'
      }
    },
    endedAt: {
      type: Date,
      default: null
    },
    cancelledAt: {
      type: Date,
      default: null
    },
    completedAt: {
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
gameSchema.index({ tags: 1 });
gameSchema.index({ endTime: 1, status: 1 });
gameSchema.index({ 'participants.userId': 1 });
gameSchema.index({ title: 'text', description: 'text' }); // Text search

// Additional indexes for discovery and join performance
gameSchema.index({ status: 1, currentPlayers: 1, maxPlayers: 1 });
gameSchema.index({ startTime: 1, status: 1 });
gameSchema.index({ tags: 1, status: 1 });
gameSchema.index({ createdAt: -1 });

// Compound index for active games query
gameSchema.index({ status: 1, endTime: 1 }, { 
  partialFilterExpression: { status: { $in: [GameStatus.OPEN, GameStatus.FULL] } } 
});

// Compound index for common discovery queries
gameSchema.index(
  { status: 1, tags: 1, startTime: 1 },
  { name: 'discovery_compound_idx' }
);

// Virtual for creator population
gameSchema.virtual('creator', {
  ref: 'User',
  localField: 'creatorId',
  foreignField: '_id',
  justOne: true
});

// Virtual for available slots calculation
gameSchema.virtual('availableSlots').get(function(this: IGameDocument) {
  return Math.max(0, this.maxPlayers - this.currentPlayers);
});

// Pre-save middleware to validate
gameSchema.pre('save', async function() {
  const doc = this as IGameDocument;
  
  // Validate currentPlayers doesn't exceed maxPlayers
  if (doc.currentPlayers > doc.maxPlayers) {
    throw new Error('Current players cannot exceed max players');
  }
  
  // Validate end time is in the future (only for new games)
  if (this.isNew && doc.endTime <= new Date()) {
    throw new Error('End time must be in the future');
  }
  
  // Auto-update status based on current players
  if (doc.currentPlayers >= doc.maxPlayers && doc.status === GameStatus.OPEN) {
    doc.status = GameStatus.FULL;
  } else if (doc.currentPlayers < doc.maxPlayers && doc.status === GameStatus.FULL) {
    doc.status = GameStatus.OPEN;
  }
});

// Model
const Game: Model<IGameDocument> = mongoose.model<IGameDocument>('Game', gameSchema);

export default Game;
