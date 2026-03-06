/**
 * Tournament Module - Repository
 * Database access layer
 */

import mongoose from 'mongoose';
import { Tournament, TournamentPayment, ITournamentDocument, IPaymentDocument, PaymentStatus, TournamentStatus } from './tournament.model';

export class TournamentRepository {
  // ── Tournament CRUD ──────────────────────────────────────────────

  async create(data: Partial<ITournamentDocument>): Promise<ITournamentDocument> {
    return Tournament.create(data);
  }

  async findById(id: string): Promise<ITournamentDocument | null> {
    return Tournament.findById(id).populate('creatorId', 'fullName avatar').exec();
  }

  async findAll(filters: Record<string, any> = {}, page = 1, limit = 20): Promise<{ data: ITournamentDocument[]; total: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      Tournament.find(filters)
        .populate('creatorId', 'fullName avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      Tournament.countDocuments(filters),
    ]);
    return { data, total };
  }

  async findByCreator(creatorId: string): Promise<ITournamentDocument[]> {
    return Tournament.find({ creatorId: new mongoose.Types.ObjectId(creatorId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async update(id: string, data: Partial<ITournamentDocument>): Promise<ITournamentDocument | null> {
    return Tournament.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
  }

  async delete(id: string): Promise<void> {
    await Tournament.findByIdAndDelete(id).exec();
  }

  async addParticipant(
    tournamentId: string,
    userId: string,
    paymentId: string
  ): Promise<ITournamentDocument | null> {
    return Tournament.findByIdAndUpdate(
      tournamentId,
      {
        $push: { participants: { userId: new mongoose.Types.ObjectId(userId), paymentId: new mongoose.Types.ObjectId(paymentId) } },
        $inc: { currentPlayers: 1 },
      },
      { new: true }
    ).exec();
  }

  async isParticipant(tournamentId: string, userId: string): Promise<boolean> {
    const tournament = await Tournament.findOne({
      _id: new mongoose.Types.ObjectId(tournamentId),
      'participants.userId': new mongoose.Types.ObjectId(userId),
    }).exec();
    return !!tournament;
  }

  // ── Payment CRUD ─────────────────────────────────────────────────

  async createPayment(data: Partial<IPaymentDocument>): Promise<IPaymentDocument> {
    return TournamentPayment.create(data);
  }

  async findPaymentById(id: string): Promise<IPaymentDocument | null> {
    return TournamentPayment.findById(id).exec();
  }

  async findPaymentByTransactionId(transactionId: string): Promise<IPaymentDocument | null> {
    return TournamentPayment.findOne({ transactionId }).exec();
  }

  async findPaymentByPayer(tournamentId: string, payerId: string): Promise<IPaymentDocument | null> {
    // Return the most recent payment (sort desc) so stale PENDING records don't shadow SUCCESS ones
    return TournamentPayment.findOne({
      tournamentId: new mongoose.Types.ObjectId(tournamentId),
      payerId: new mongoose.Types.ObjectId(payerId),
    })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findSuccessfulPaymentByPayer(tournamentId: string, payerId: string): Promise<IPaymentDocument | null> {
    return TournamentPayment.findOne({
      tournamentId: new mongoose.Types.ObjectId(tournamentId),
      payerId: new mongoose.Types.ObjectId(payerId),
      status: 'success',
    }).exec();
  }

  async updatePayment(id: string, data: Partial<IPaymentDocument>): Promise<IPaymentDocument | null> {
    return TournamentPayment.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async getCreatorTransactions(creatorId: string): Promise<any[]> {
    // Get all tournaments by creator
    const tournaments = await Tournament.find({
      creatorId: new mongoose.Types.ObjectId(creatorId),
    }).select('_id name').exec();

    const tournamentIds = tournaments.map((t) => t._id);

    const payments = await TournamentPayment.find({
      tournamentId: { $in: tournamentIds },
      status: PaymentStatus.SUCCESS,
    })
      .populate('payerId', 'fullName email avatar')
      .populate('tournamentId', 'name entryFee')
      .sort({ paidAt: -1 })
      .exec();

    return payments;
  }

  async getTournamentPayments(tournamentId: string): Promise<IPaymentDocument[]> {
    return TournamentPayment.find({ tournamentId: new mongoose.Types.ObjectId(tournamentId) })
      .populate('payerId', 'fullName email avatar')
      .exec();
  }
}
