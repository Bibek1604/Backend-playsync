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
    const result = await svc.getTournaments(1, 20);
    res.json({ success: true, data: result.data || result, pagination: { total: result.total, page: 1, limit: 20 } });
  });

  getTournament = asyncHandler(async (req: Request, res: Response) => {
    const tournament = await svc.getTournamentById(req.params.id);
    res.json({ success: true, data: tournament });
  });

  // Aliases for backwards compatibility with routes
  getTournaments = this.listTournaments;
  getTournamentById = this.getTournament;

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
    const tournamentId = req.params.id || req.params.tournamentId;
    const status = await svc.getPaymentStatus(tournamentId, userId);
    res.json({ success: true, data: { status } });
  });

  checkChatAccess = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const tournamentId = req.params.id || req.params.tournamentId;
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
}

