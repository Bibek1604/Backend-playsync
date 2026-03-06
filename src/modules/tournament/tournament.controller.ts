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
                    creatorId: t.adminId, // Alias for frontend compatibility
                    isPaid,
                    isParticipant,
                    paymentStatus: userPayment?.status || 'NOT_PAID'
                };
            });
            return res.json({ success: true, data: enhanced });
        }

        // Transform adminId to creatorId for frontend compatibility
        const transformed = tournaments.map(t => ({ ...t, creatorId: t.adminId }));
        res.json({ success: true, data: transformed });
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
            data: { ...tournament, creatorId: tournament.adminId, isPaid, paymentStatus }
        });
    }

    // Get Payment Status for a user in a tournament
    async getPaymentStatus(req: Request, res: Response) {
        const userId = (req as any).user.id;
        const tournamentId = req.params.id;

        if (!userId || !tournamentId) {
            throw new AppError('Missing userId or tournamentId', 400);
        }

        try {
            const payment = await Payment.findOne({
                tournamentId: new mongoose.Types.ObjectId(tournamentId),
                payerId: new mongoose.Types.ObjectId(userId)
            }).sort({ createdAt: -1 });

            const status = payment ? payment.status.toLowerCase() : null;
            console.log(`[PAYMENT] Status check: user=${userId} tournament=${tournamentId} status=${status}`);

            res.json({
                success: true,
                data: {
                    status,
                    paymentId: payment?._id?.toString() || null,
                    amount: payment?.amount || null,
                    transactionId: payment?.transactionId || null
                }
            });
        } catch (err) {
            console.error('[PAYMENT] Status check error:', err);
            throw new AppError('Failed to fetch payment status', 500);
        }
    }

    // Check Chat Access for a tournament
    async checkChatAccess(req: Request, res: Response) {
        const userId = (req as any).user.id;
        const tournamentId = req.params.id;

        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) throw new AppError('Tournament not found', 404);

        // Creator/admin always has access (no payment required)
        if (tournament.adminId.toString() === userId.toString()) {
            console.log(`[CHAT] Creator access granted for user=${userId} tournament=${tournamentId}`);
            return res.json({ success: true, data: { allowed: true } });
        }

        // Check if user is participant
        const isParticipant = tournament.participants.some(p => p.toString() === userId.toString());
        if (!isParticipant) {
            console.log(`[CHAT] Access denied - not a participant: user=${userId} tournament=${tournamentId}`);
            return res.json({ success: true, data: { allowed: false } });
        }

        // Participant must have successful payment
        const payment = await Payment.findOne({
            tournamentId: new mongoose.Types.ObjectId(tournamentId),
            payerId: new mongoose.Types.ObjectId(userId),
            status: PaymentStatus.SUCCESS
        });

        const allowed = !!payment;
        console.log(`[CHAT] Access check for participant: user=${userId} tournament=${tournamentId} allowed=${allowed}`);
        res.json({
            success: true,
            data: { allowed }
        });
    }
/**
 * Tournament Module - Controller
 */

import { Request, Response, NextFunction } from 'express';
import { TournamentService } from './tournament.service';
import { asyncHandler } from '../../Share/utils/asyncHandler';

const svc = new TournamentService();

export class TournamentController {
  // ── Tournaments ───────────────────────────────────────────────────

  createTournament = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const tournament = await svc.createTournament(userId, req.body);
    res.status(201).json({ success: true, data: tournament });
  });

  listTournaments = asyncHandler(async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const { status, type } = req.query as any;
    const result = await svc.getTournaments(page, limit, status, type);
    res.json({ success: true, ...result });
  });

  getTournament = asyncHandler(async (req: Request, res: Response) => {
    const tournament = await svc.getTournamentById(req.params.id);
    res.json({ success: true, data: tournament });
  });

  getMyTournaments = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const tournaments = await svc.getMyTournaments(userId);
    res.json({ success: true, data: tournaments });
  });

  updateTournament = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const updated = await svc.updateTournament(req.params.id, userId, req.body);
    res.json({ success: true, data: updated });
  });

  deleteTournament = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    await svc.deleteTournament(req.params.id, userId);
    res.json({ success: true, message: 'Tournament deleted' });
  });

  // ── Payment ───────────────────────────────────────────────────────

  initiatePayment = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const userEmail = (req as any).user.email || '';
    const { tournamentId } = req.params;
    const result = await svc.initiatePayment(tournamentId, userId, userEmail);
    res.json({ success: true, data: result });
  });

  verifyPayment = asyncHandler(async (req: Request, res: Response) => {
    const { transactionUuid } = req.body;
    if (!transactionUuid) {
      res.status(400).json({ success: false, message: 'transactionUuid is required' });
      return;
    }
    const result = await svc.verifyAndCompletPayment(transactionUuid);
    res.json({ success: true, data: result });
  });

  getPaymentStatus = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { tournamentId } = req.params;
    const status = await svc.getPaymentStatus(tournamentId, userId);
    res.json({ success: true, data: { status } });
  });

  checkChatAccess = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { tournamentId } = req.params;
    const allowed = await svc.canAccessChat(tournamentId, userId);
    res.json({ success: true, data: { allowed } });
  });

  // ── Creator Dashboard ─────────────────────────────────────────────

  getMyTransactions = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const result = await svc.getCreatorTransactions(userId);
    res.json({ success: true, data: result });
  });

  getTournamentPayments = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const payments = await svc.getTournamentPayments(req.params.id, userId);
    res.json({ success: true, data: payments });
  });
 main
}
