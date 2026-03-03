import { Router } from 'express';
import { TournamentController } from './tournament.controller';
import { auth, authorize } from '../auth/auth.middleware';
import { asyncHandler } from '../../Share/utils/asyncHandler';

const router = Router();
const controller = new TournamentController();

// Create tournament - admin only
router.post('/', auth, authorize('admin'), asyncHandler(controller.createTournament.bind(controller)));

// Get all tournaments
router.get('/', auth, asyncHandler(controller.getTournaments.bind(controller)));

// Get specific tournament
router.get('/:id', auth, asyncHandler(controller.getTournamentById.bind(controller)));

// Get Payment status for user
router.get('/:id/payment/status', auth, asyncHandler(controller.getPaymentStatus.bind(controller)));

// Check Chat Access
router.get('/:id/chat/access', auth, asyncHandler(controller.checkChatAccess.bind(controller)));

export default router;
