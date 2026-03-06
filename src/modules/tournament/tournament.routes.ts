import { Router } from 'express';
import type { Request, Response } from 'express';
import { TournamentController } from './tournament.controller';
import { PaymentController } from '../payment/payment.controller';
import { auth, authorize } from '../auth/auth.middleware';
import { asyncHandler } from '../../Share/utils/asyncHandler';

const router = Router();
const controller = new TournamentController();
const paymentController = new PaymentController();

// Create tournament - admin only
router.post('/', auth, authorize('admin'), asyncHandler(controller.createTournament.bind(controller)));

// Get all tournaments
router.get('/', auth, asyncHandler(controller.getTournaments.bind(controller)));

// Get specific tournament
router.get('/:id', auth, asyncHandler(controller.getTournamentById.bind(controller)));

// Get Payment status for user
router.get('/:id/payment/status', auth, asyncHandler(controller.getPaymentStatus.bind(controller)));

// Legacy alias for older clients
router.get('/:id/payment-status', auth, asyncHandler(controller.getPaymentStatus.bind(controller)));

// Legacy payment initiate endpoint used by older mobile builds
router.post('/:id/pay', auth, asyncHandler(async (req: Request, res: Response) => {
	req.body = {
		...(req.body ?? {}),
		tournamentId: req.params.id,
	};
	return paymentController.initiatePayment(req, res);
}));

// Legacy verify endpoint used by older mobile builds
// Current controller supports no-data fallback and verifies latest pending payment.
router.post('/payment/verify', auth, asyncHandler(async (req: Request, res: Response) => {
	return paymentController.verifyPayment(req, res);
}));

// Check Chat Access
router.get('/:id/chat/access', auth, asyncHandler(controller.checkChatAccess.bind(controller)));

// Legacy alias for older clients
router.get('/:id/chat-access', auth, asyncHandler(controller.checkChatAccess.bind(controller)));

export default router;
