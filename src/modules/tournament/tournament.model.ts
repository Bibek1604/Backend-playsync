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

const tournamentSchema = new Schema<ITournamentDocument>({
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, enum: Object.values(TournamentType), required: true },
    location: { type: String },
    maxPlayers: { type: Number, required: true },
    currentPlayers: { type: Number, default: 0 },
    entryFee: { type: Number, required: true },
    prizeDetails: { type: String, required: true },
    startTime: { type: Date, required: true },
    status: { type: String, enum: Object.values(TournamentStatus), default: TournamentStatus.OPEN },
    adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

// Auto-update status
tournamentSchema.pre('save', async function (this: ITournamentDocument) {
    if (this.currentPlayers >= this.maxPlayers && this.status === TournamentStatus.OPEN) {
        this.status = TournamentStatus.FULL;
    }
});

const Tournament: Model<ITournamentDocument> = mongoose.model<ITournamentDocument>('Tournament', tournamentSchema);
export default Tournament;
