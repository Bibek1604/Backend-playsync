import { Request, Response } from 'express';
import { Tournament, TournamentPayment, PaymentStatus, TournamentStatus } from '../tournament/tournament.model';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import AppError from '../../Share/utils/AppError';
import { buildEsewaPaymentParams, ESEWA_PAYMENT_URL_EXPORT } from '../tournament/esewa.service';

// ESewa Test Mode Configuration
const SECRET_KEY = process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q';
const MERCHANT_ID = process.env.ESEWA_MERCHANT_CODE || 'EPAYTEST';
// ESEWA Gateway Configuration
const ESEWA_URL = process.env.ESEWA_URL || ESEWA_PAYMENT_URL_EXPORT;
const getCallbackUrl = (tournamentId: string) => `${process.env.CALLBACK_URL || 'http://localhost:3000/tournaments'}/${tournamentId}`;
const ensureHttpsIfRemote = (url: string) => {
    if (url.startsWith('http://localhost') || url.startsWith('http://127.0.0.1')) {
        return url;
    }
    return url.replace(/^http:\/\//i, 'https://');
};


export class PaymentController {

    // 1. Initiate Payment - User generates a transaction intent
    async initiatePayment(req: Request, res: Response) {
        const { tournamentId } = req.body;
        const userId = (req as any).user.id;

        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) throw new AppError('Tournament not found', 404);

        if (tournament.status !== TournamentStatus.OPEN) {
            throw new AppError('Tournament is no longer accepting participants', 400);
        }
        if (tournament.currentPlayers >= tournament.maxPlayers) {
            throw new AppError('Tournament is already full', 400);
        }

        // Check if user already paid
        const existingPayment = await TournamentPayment.findOne({
            tournamentId: new mongoose.Types.ObjectId(tournamentId),
            payerId: new mongoose.Types.ObjectId(userId),
            status: PaymentStatus.SUCCESS
        });
        if (existingPayment) throw new AppError('You have already joined this tournament', 400);

        const transactionId = `${tournamentId.toString().slice(-8)}_${userId.toString().slice(-8)}_${Date.now()}_${uuidv4().slice(0, 8)}`;
        const amount = tournament.entryFee;
        const amountFixed = Number(amount).toFixed(2);

        const successUrl = ensureHttpsIfRemote(`${getCallbackUrl(tournamentId.toString())}?status=success`);
        const failureUrl = ensureHttpsIfRemote(`${getCallbackUrl(tournamentId.toString())}?status=failure`);

        // Keep internal signature for traceability/log parity.
        const message = `total_amount=${amountFixed},transaction_uuid=${transactionId},product_code=${MERCHANT_ID}`;
        const hmac = crypto.createHmac('sha256', SECRET_KEY);
        hmac.update(message);
        const signature = hmac.digest('base64');

        console.log(`[PAYMENT] Signature message: ${message}`);
        console.log(`[PAYMENT] Signature: ${signature}`);

        // Create Pending Payment record
        const payment = await TournamentPayment.create({
            tournamentId: new mongoose.Types.ObjectId(tournamentId),
            payerId: new mongoose.Types.ObjectId(userId),
            amount,
            transactionId,
            status: PaymentStatus.PENDING,
            signature
        });

        console.log(`[PAYMENT] Initiated: ${payment._id} user=${userId} tournament=${tournamentId} txId=${transactionId}`);

        // Build eSewa v2 signed payload expected by frontend form submitter.
        const paymentParams = buildEsewaPaymentParams({
            amount: Number(amountFixed),
            transactionUuid: transactionId,
            productName: (tournament as any).name || 'Tournament Entry',
            successUrl,
            failureUrl,
        });

        res.json({
            success: true,
            data: {
                paymentId: payment._id,
                transactionId,
                amount,
                productCode: MERCHANT_ID,
                merchantCode: MERCHANT_ID,
                paymentUrl: ESEWA_URL,
                signature: paymentParams.signature,
                signedFieldNames: paymentParams.signed_field_names,
                params: paymentParams
            }
        });
    }

    // 2. Verify Payment from eSewa redirect (with fallback for data-less callbacks)
    async verifyPayment(req: Request, res: Response) {
        const { data } = req.query;
        const userId = (req as any).user.id;
        let payment: any = null;

        // Mode 1: Explicit data from eSewa
        if (data && typeof data === 'string') {
            let parsedData: any;
            try {
                const decodedBuffer = Buffer.from(data, 'base64');
                const decodedString = decodedBuffer.toString('utf-8');
                parsedData = JSON.parse(decodedString);
                console.log('[PAYMENT] Verify with data:', parsedData);
            } catch (err) {
                console.error('[PAYMENT] Decode error:', err);
                throw new AppError('Invalid payment data format', 400);
            }

            if (parsedData.status !== 'COMPLETE') {
                throw new AppError('Payment not completed', 400);
            }

            const transactionId = parsedData.transaction_uuid;
            if (!transactionId) throw new AppError('Missing transaction_uuid', 400);

            payment = await TournamentPayment.findOne({ transactionId });
            if (!payment) throw new AppError('Payment record not found', 404);
        } else {
            // Mode 2: Fallback - auto-verify user's recent PENDING payment
            if (!userId) throw new AppError('User not authenticated', 401);

            payment = await TournamentPayment.findOne({
                payerId: new mongoose.Types.ObjectId(userId),
                status: PaymentStatus.PENDING,
                createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
            }).sort({ createdAt: -1 });

            if (!payment) throw new AppError('No pending payment found', 404);
            console.log(`[PAYMENT] Auto-verifying recent PENDING: ${payment._id}`);
        }

        if (payment.status === PaymentStatus.SUCCESS) {
            console.log(`[PAYMENT] Already SUCCESS: ${payment._id}`);
            return res.json({
                success: true,
                message: 'Already marked as complete',
                data: {
                    _id: payment._id,
                    amount: payment.amount,
                    transactionId: payment.transactionId,
                    status: 'success',
                    paidAt: payment.updatedAt,
                },
            });
        }

        payment.status = PaymentStatus.SUCCESS;
        await payment.save();
        console.log(`[PAYMENT] Updated to SUCCESS: ${payment._id}`);

        const updatedTournament = await Tournament.findOneAndUpdate(
            { _id: payment.tournamentId, 'participants.userId': { $ne: payment.payerId } },
            {
                $push: {
                    participants: {
                        userId: payment.payerId,
                        paymentId: payment._id,
                        joinedAt: new Date()
                    }
                },
                $inc: { currentPlayers: 1 }
            },
            { new: true }
        );

        if (updatedTournament && updatedTournament.currentPlayers >= updatedTournament.maxPlayers) {
            updatedTournament.status = TournamentStatus.FULL;
            await updatedTournament.save();
        }

        res.json({
            success: true,
            message: 'Payment successful and joined tournament',
            data: {
                _id: payment._id,
                amount: payment.amount,
                transactionId: payment.transactionId,
                status: 'success',
                paidAt: payment.updatedAt,
            },
        });
    }

    // 3. Admin Transaction Dashboard
    async getTransactions(req: Request, res: Response) {
        // Admin only route
        const payments = await TournamentPayment.find()
            .populate('payerId', 'fullName profilePicture')
            .populate('tournamentId', 'name title')
            .sort({ createdAt: -1 });

        const totalCollected = await TournamentPayment.aggregate([
            { $match: { status: PaymentStatus.SUCCESS } },
            { $group: { _id: null, sum: { $sum: "$amount" } } }
        ]);

        res.json({
            success: true,
            data: {
                transactions: payments,
                totalCollected: totalCollected.length > 0 ? totalCollected[0].sum : 0
            }
        });
    }
}
