/**
 * Tournament Module - Routes
 */

import { Router } from 'express';
import { TournamentController } from './tournament.controller';
import { auth } from '../auth/auth.middleware';
import validateDto from '../../Share/utils/validateDto';
import { createTournamentSchema, updateTournamentSchema } from './tournament.dto';
import { requireTournamentChatAccess } from './tournament.middleware';

const router = Router();
const ctrl = new TournamentController();

// ── Public ────────────────────────────────────────────────────
/** GET /api/v1/tournaments */
router.get('/', ctrl.listTournaments);

/** GET /api/v1/tournaments/:id */
router.get('/:id', ctrl.getTournament);

// ── Authenticated ─────────────────────────────────────────────
/** POST /api/v1/tournaments */
router.post('/', auth, validateDto(createTournamentSchema), ctrl.createTournament);

/** GET /api/v1/tournaments/mine/list */
router.get('/mine/list', auth, ctrl.getMyTournaments);

/** PATCH /api/v1/tournaments/:id */
router.patch('/:id', auth, validateDto(updateTournamentSchema), ctrl.updateTournament);

/** DELETE /api/v1/tournaments/:id */
router.delete('/:id', auth, ctrl.deleteTournament);

// ── Payment ───────────────────────────────────────────────────
/** POST /api/v1/tournaments/:tournamentId/pay  — initiate payment */
router.post('/:tournamentId/pay', auth, ctrl.initiatePayment);

/** POST /api/v1/tournaments/payment/verify  — verify after eSewa callback */
router.post('/payment/verify', auth, ctrl.verifyPayment);

/** GET /api/v1/tournaments/:tournamentId/payment-status */
router.get('/:tournamentId/payment-status', auth, ctrl.getPaymentStatus);

// ── Chat Access ───────────────────────────────────────────────
/** GET /api/v1/tournaments/:tournamentId/chat-access */
router.get('/:tournamentId/chat-access', auth, ctrl.checkChatAccess);

// ── Creator Dashboard ─────────────────────────────────────────
/** GET /api/v1/tournaments/dashboard/transactions */
router.get('/dashboard/transactions', auth, ctrl.getMyTransactions);

/** GET /api/v1/tournaments/:id/payments */
router.get('/:id/payments', auth, ctrl.getTournamentPayments);

export default router;
