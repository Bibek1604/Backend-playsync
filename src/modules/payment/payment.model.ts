import mongoose, { Document, Schema, Model } from 'mongoose';

export enum PaymentStatus {
    PENDING = 'PENDING',
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED'
}

export interface IPaymentDocument extends Document {
    tournamentId: mongoose.Types.ObjectId;
    payerId: mongoose.Types.ObjectId;
    amount: number;
    transactionId?: string;
    status: PaymentStatus;
    signature?: string;
    createdAt: Date;
    updatedAt: Date;
}

const paymentSchema = new Schema<IPaymentDocument>({
    tournamentId: { type: Schema.Types.ObjectId, ref: 'Tournament', required: true },
    payerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    transactionId: { type: String },
    status: { type: String, enum: Object.values(PaymentStatus), default: PaymentStatus.PENDING },
    signature: { type: String }
}, { timestamps: true });

const Payment: Model<IPaymentDocument> = mongoose.model<IPaymentDocument>('Payment', paymentSchema);
export default Payment;
