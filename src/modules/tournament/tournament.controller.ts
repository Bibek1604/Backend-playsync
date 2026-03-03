import { Request, Response } from 'express';
import Tournament, { TournamentType } from './tournament.model';
import Payment, { PaymentStatus } from '../payment/payment.model';
import mongoose from 'mongoose';
import AppError from '../../Share/utils/AppError';

export class TournamentController {

    // Create Tournament (Admin Only)
    async createTournament(req: Request, res: Response) {
        const { title, description, type, location, maxPlayers, entryFee, prizeDetails, startTime } = req.body;

        // Assuming admin auth middleware sets req.user
        const adminId = (req as any).user.id;

        if (type === TournamentType.OFFLINE && !location) {
            throw new AppError('Location is mandatory for offline tournaments', 400);
        }

        const tournament = await Tournament.create({
            title, description, type, location, maxPlayers, entryFee, prizeDetails, startTime,
            adminId: new mongoose.Types.ObjectId(adminId)
        });

        res.status(201).json({ success: true, data: tournament });
    }

    // Get all tournaments (Public)
    async getTournaments(req: Request, res: Response) {
        const userId = (req as any).user?.id; // Could be logged in user
        const tournaments = await Tournament.find()
            .populate('adminId', 'fullName profilePicture')
            .sort({ createdAt: -1 })
            .lean();

        // If user is logged in, attach their payment status for each tournament
        if (userId) {
            const payments = await Payment.find({ payerId: new mongoose.Types.ObjectId(userId) }).lean();

            const enhanced = tournaments.map(t => {
                const userPayment = payments.find(p => p.tournamentId.toString() === t._id.toString());
                const isPaid = (userPayment?.status === PaymentStatus.SUCCESS) || (t.adminId._id.toString() === userId.toString());
                const isParticipant = t.participants.some(p => p.toString() === userId.toString()) || (t.adminId._id.toString() === userId.toString());
                return {
                    ...t,
                    isPaid,
                    isParticipant,
                    paymentStatus: userPayment?.status || 'NOT_PAID'
                };
            });
            return res.json({ success: true, data: enhanced });
        }

        res.json({ success: true, data: tournaments });
    }

    // Get tournament by ID
    async getTournamentById(req: Request, res: Response) {
        const tournament = await Tournament.findById(req.params.id)
            .populate('adminId', 'fullName profilePicture')
            .populate('participants', 'fullName profilePicture')
            .lean();

        if (!tournament) throw new AppError('Tournament not found', 404);

        const userId = (req as any).user?.id;
        let isPaid = false;
        let paymentStatus = 'NOT_PAID';

        if (userId) {
            const userPayment = await Payment.findOne({
                tournamentId: new mongoose.Types.ObjectId(req.params.id),
                payerId: new mongoose.Types.ObjectId(userId)
            });
            isPaid = (userPayment?.status === PaymentStatus.SUCCESS) || (tournament.adminId._id.toString() === userId.toString());
            paymentStatus = userPayment?.status || 'NOT_PAID';
        }

        res.json({
            success: true,
            data: { ...tournament, isPaid, paymentStatus }
        });
    }

    // Get Payment Status for a user in a tournament
    async getPaymentStatus(req: Request, res: Response) {
        const userId = (req as any).user.id;
        const tournamentId = req.params.id;

        const payment = await Payment.findOne({
            tournamentId: new mongoose.Types.ObjectId(tournamentId),
            payerId: new mongoose.Types.ObjectId(userId)
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            data: { status: payment ? payment.status.toLowerCase() : null }
        });
    }

    // Check Chat Access for a tournament
    async checkChatAccess(req: Request, res: Response) {
        const userId = (req as any).user.id;
        const tournamentId = req.params.id;

        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) throw new AppError('Tournament not found', 404);

        // Admin/creator has access
        if (tournament.adminId.toString() === userId.toString()) {
            return res.json({ success: true, data: { allowed: true } });
        }

        // Must be participant AND paid
        const isParticipant = tournament.participants.some(p => p.toString() === userId.toString());
        if (!isParticipant) {
            return res.json({ success: true, data: { allowed: false } });
        }

        const payment = await Payment.findOne({
            tournamentId: new mongoose.Types.ObjectId(tournamentId),
            payerId: new mongoose.Types.ObjectId(userId),
            status: PaymentStatus.SUCCESS
        });

        res.json({
            success: true,
            data: { allowed: !!payment }
        });
    }
}
