import mongoose, { Document, Schema, Model } from 'mongoose';

export enum TournamentType {
    ONLINE = 'ONLINE',
    OFFLINE = 'OFFLINE'
}

export enum TournamentStatus {
    OPEN = 'OPEN',
    FULL = 'FULL',
    CLOSED = 'CLOSED'
}

export enum PaymentStatus {
    PENDING = 'pending',
    SUCCESS = 'success',
    FAILED = 'failed',
    REFUNDED = 'refunded',
}

export interface ITournamentDocument extends Document {
    title: string;
    description: string;
    type: TournamentType;
    location?: string;
    maxPlayers: number;
    currentPlayers: number;
    entryFee: number;
    prizeDetails: string;
    startTime: Date;
    status: TournamentStatus;
    adminId: mongoose.Types.ObjectId;
    participants: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Tournament Module - Mongoose Models
 * Database schemas for tournaments and payments
 */

// ─────────────────────────────────────────────
// Interfaces
// ─────────────────────────────────────────────
export interface ITournamentParticipant {
  userId: mongoose.Types.ObjectId;
  joinedAt: Date;
  paymentId: mongoose.Types.ObjectId;
}

export interface IPaymentDocument extends Document {
  tournamentId: mongoose.Types.ObjectId;
  payerId: mongoose.Types.ObjectId;
  amount: number;
  transactionId: string; // eSewa transaction UUID
  refId?: string; // eSewa ref ID after verification
  status: PaymentStatus;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ─────────────────────────────────────────────
// Participant Sub-Schema
// ─────────────────────────────────────────────
const participantSchema = new Schema<ITournamentParticipant>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    joinedAt: { type: Date, default: Date.now },
    paymentId: { type: Schema.Types.ObjectId, ref: 'TournamentPayment', required: true },
  },
  { _id: false }
);

// ─────────────────────────────────────────────
// Tournament Schema
// ─────────────────────────────────────────────
const tournamentSchema = new Schema<ITournamentDocument>(
  {
    name: {
      type: String,
      required: [true, 'Tournament name is required'],
      trim: true,
      minlength: [3, 'Name must be at least 3 characters'],
      maxlength: [100, 'Name must not exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [2000, 'Description must not exceed 2000 characters'],
    },
    type: {
      type: String,
      enum: Object.values(TournamentType),
      required: true,
      default: TournamentType.ONLINE,
    },
    location: {
      type: String,
      trim: true,
    },
    maxPlayers: {
      type: Number,
      required: true,
      min: [2, 'Minimum 2 players required'],
      max: [1000, 'Maximum 1000 players allowed'],
    },
    currentPlayers: {
      type: Number,
      default: 0,
    },
    entryFee: {
      type: Number,
      required: true,
      min: [0, 'Entry fee cannot be negative'],
    },
    prize: {
      type: String,
      required: true,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: Object.values(TournamentStatus),
      default: TournamentStatus.OPEN,
    },
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    participants: [participantSchema],
  },
  { timestamps: true }
);

// Auto-update status to FULL when maxPlayers reached
tournamentSchema.pre('save', function () {
  if (this.currentPlayers >= this.maxPlayers && this.status === TournamentStatus.OPEN) {
    this.status = TournamentStatus.FULL;
  }
});

// ─────────────────────────────────────────────
// Payment Schema
// ─────────────────────────────────────────────
const paymentSchema = new Schema<IPaymentDocument>(
  {
    tournamentId: {
      type: Schema.Types.ObjectId,
      ref: 'Tournament',
      required: true,
    },
    payerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Amount cannot be negative'],
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    refId: {
      type: String,
    },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
    },
    paidAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Indexes
tournamentSchema.index({ creatorId: 1 });
tournamentSchema.index({ status: 1, startDate: -1 });
paymentSchema.index({ tournamentId: 1, payerId: 1 });
paymentSchema.index({ transactionId: 1 });

export const Tournament = mongoose.model<ITournamentDocument>('Tournament', tournamentSchema);
export const TournamentPayment = mongoose.model<IPaymentDocument>('TournamentPayment', paymentSchema);
