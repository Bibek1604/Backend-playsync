/**
 * Tournament Module - Service Layer
 * Core business logic
 */

import { v4 as uuidv4 } from 'uuid';
import { TournamentRepository } from './tournament.repository';
import { CreateTournamentDTO, UpdateTournamentDTO } from './tournament.dto';
import {
  ITournamentDocument,
  IPaymentDocument,
  PaymentStatus,
  TournamentStatus,
} from './tournament.model';
import AppError from '../../Share/utils/AppError';
import {
  buildEsewaPaymentParams,
  verifyEsewaTransaction,
  ESEWA_PAYMENT_URL_EXPORT,
} from './esewa.service';

const FRONTEND_BASE = process.env.FRONTEND_URL || 'http://localhost:3000';

export class TournamentService {
  private repo: TournamentRepository;

  constructor() {
    this.repo = new TournamentRepository();
  }

  /**
   * creatorId may be a raw ObjectId OR a populated object { _id, username, avatar }
   * depending on whether the query used .populate(). Always extract _id safely.
   */
  private creatorIdStr(creatorId: any): string {
    return creatorId?._id?.toString() ?? creatorId?.toString();
  }

  // ─────────────────────────────────────────────
  // Tournament CRUD
  // ─────────────────────────────────────────────

  async createTournament(creatorId: string, data: CreateTournamentDTO): Promise<ITournamentDocument> {
    return this.repo.create({
      ...data,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      creatorId: creatorId as any,
      status: TournamentStatus.OPEN,
      currentPlayers: 0,
      participants: [],
    });
  }

  async getTournaments(
    page = 1,
    limit = 20,
    status?: TournamentStatus,
    type?: string
  ) {
    const filters: Record<string, any> = {};
    if (status) filters.status = status;
    if (type) filters.type = type;
    return this.repo.findAll(filters, page, limit);
  }

  async getTournamentById(id: string): Promise<ITournamentDocument> {
    const tournament = await this.repo.findById(id);
    if (!tournament) throw new AppError('Tournament not found', 404);
    return tournament;
  }

  async getMyTournaments(creatorId: string): Promise<ITournamentDocument[]> {
    return this.repo.findByCreator(creatorId);
  }

  async updateTournament(
    id: string,
    userId: string,
    data: UpdateTournamentDTO
  ): Promise<ITournamentDocument> {
    const tournament = await this.repo.findById(id);
    if (!tournament) throw new AppError('Tournament not found', 404);
    if (this.creatorIdStr(tournament.creatorId) !== userId)
      throw new AppError('Only the creator can update this tournament', 403);

    const updated = await this.repo.update(id, {
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
    } as any);
    return updated!;
  }

  async deleteTournament(id: string, userId: string): Promise<void> {
    const tournament = await this.repo.findById(id);
    if (!tournament) throw new AppError('Tournament not found', 404);
    if (this.creatorIdStr(tournament.creatorId) !== userId)
      throw new AppError('Only the creator can delete this tournament', 403);
    await this.repo.delete(id);
  }

  // ─────────────────────────────────────────────
  // Payment Flow
  // ─────────────────────────────────────────────

  /**
   * Initiate eSewa payment — creates a pending payment record and returns
   * the eSewa form URL + params so the frontend can auto-POST.
   */
  async initiatePayment(
    tournamentId: string,
    userId: string,
    userEmail: string
  ): Promise<{ paymentUrl: string; params: Record<string, string>; paymentId: string }> {
    const tournament = await this.getTournamentById(tournamentId);

    if (tournament.status === TournamentStatus.FULL)
      throw new AppError('Tournament is full', 400);
    if (tournament.status !== TournamentStatus.OPEN)
      throw new AppError('Tournament is not open for registration', 400);
    if (this.creatorIdStr(tournament.creatorId) === userId)
      throw new AppError('Creator cannot join their own tournament', 400);

    // Check if already paid
    const existing = await this.repo.findPaymentByPayer(tournamentId, userId);
    if (existing && existing.status === PaymentStatus.SUCCESS) {
      throw new AppError('You have already paid for this tournament', 400);
    }

    const transactionUuid = uuidv4();
    // Do NOT add ?pid= to success URL — eSewa appends ?data=BASE64 (not &data=)
    // causing ?pid=UUID?data=BASE64 which breaks URLSearchParams parsing.
    // The transaction_uuid is inside eSewa's own base64 data payload.
    const successUrl = `${FRONTEND_BASE}/tournaments/payment/success`;
    const failureUrl = `${FRONTEND_BASE}/tournaments/payment/failure?pid=${transactionUuid}`;

    // Create pending payment record
    const payment = await this.repo.createPayment({
      tournamentId: tournament._id as any,
      payerId: userId as any,
      amount: tournament.entryFee,
      transactionId: transactionUuid,
      status: PaymentStatus.PENDING,
    });

    const params = buildEsewaPaymentParams({
      amount: tournament.entryFee,
      transactionUuid,
      productName: tournament.name,
      successUrl,
      failureUrl,
    });

    return {
      paymentUrl: ESEWA_PAYMENT_URL_EXPORT,
      params,
      paymentId: (payment._id as any).toString(),
    };
  }

  /**
   * Verify eSewa callback and finalize membership
   */
  async verifyAndCompletPayment(
    transactionUuid: string,
    encodedData?: string
  ): Promise<{ success: boolean; tournamentId: string }> {
    const payment = await this.repo.findPaymentByTransactionId(transactionUuid);
    if (!payment) {
      // Could be a race condition where DB write hasn't propagated yet — allow frontend retry
      throw new AppError(`Payment record not found for ID: ${transactionUuid}`, 404);
    }

    if (payment.status === PaymentStatus.SUCCESS) {
      return { success: true, tournamentId: payment.tournamentId.toString() };
    }

    // Verify with eSewa — may throw a 502 if eSewa API is unreachable
    let verification;
    try {
      verification = await verifyEsewaTransaction({
        transactionUuid,
        totalAmount: payment.amount,
      });
    } catch {
      // eSewa API unreachable — tell frontend to retry
      throw new AppError('Could not reach eSewa verification service. Please try again.', 202);
    }

    if (verification.status === 'PENDING' || verification.status === 'NOT_FOUND' || verification.status === 'AMBIGUOUS') {
      // These are transient states — allow frontend to retry
      throw new AppError('Payment is still being processed. Please wait a moment.', 202);
    }

    if (verification.status !== 'COMPLETE') {
      await this.repo.updatePayment((payment._id as any).toString(), {
        status: PaymentStatus.FAILED,
      });
      throw new AppError(`Payment not completed. eSewa status: ${verification.status}`, 402);
    }

    // Mark success
    await this.repo.updatePayment((payment._id as any).toString(), {
      status: PaymentStatus.SUCCESS,
      refId: verification.ref_id,
      paidAt: new Date(),
    });

    // Add participant to tournament
    await this.repo.addParticipant(
      payment.tournamentId.toString(),
      payment.payerId.toString(),
      (payment._id as any).toString()
    );

    return { success: true, tournamentId: payment.tournamentId.toString() };
  }

  /**
   * Check if a user has paid for a tournament
   */
  async getPaymentStatus(tournamentId: string, userId: string): Promise<PaymentStatus | null> {
    const payment = await this.repo.findPaymentByPayer(tournamentId, userId);
    return payment ? payment.status : null;
  }

  /**
   * Check whether user can access tournament chat
   * Rules: creator OR paid participant
   */
  async canAccessChat(tournamentId: string, userId: string): Promise<boolean> {
    const tournament = await this.repo.findById(tournamentId);
    if (!tournament) return false;

    // creatorId may be a populated object { _id, username, avatar } or a raw ObjectId
    const creatorIdStr = this.creatorIdStr(tournament.creatorId);
    if (creatorIdStr === userId) return true;

    // Explicitly look for a SUCCESS payment so old PENDING records don't block access
    const payment = await this.repo.findSuccessfulPaymentByPayer(tournamentId, userId);
    return !!payment;
  }

  // ─────────────────────────────────────────────
  // Creator Dashboard
  // ─────────────────────────────────────────────

  async getCreatorTransactions(creatorId: string) {
    const payments = await this.repo.getCreatorTransactions(creatorId);
    const total = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    return { payments, totalCollected: total };
  }

  async getTournamentPayments(tournamentId: string, requesterId: string) {
    const tournament = await this.repo.findById(tournamentId);
    if (!tournament) throw new AppError('Tournament not found', 404);
    if (this.creatorIdStr(tournament.creatorId) !== requesterId)
      throw new AppError('Only creator can view payments', 403);
    return this.repo.getTournamentPayments(tournamentId);
  }
}
