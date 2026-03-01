import { Router } from 'express';
import { InviteLinkController } from './invite-link.controller';
import { auth } from '../auth/auth.middleware';
import { asyncHandler } from '../../Share/utils/asyncHandler';

const router = Router();
const controller = new InviteLinkController();

// Generate invite link (creator only - checked in controller)
router.post('/:id/invite', auth, asyncHandler(controller.generateInvite.bind(controller)));

// Get invite details
router.get('/invite/:code', asyncHandler(controller.getInviteDetails.bind(controller)));

// Join via invite link
router.post('/invite/:code/join', auth, asyncHandler(controller.joinWithInvite.bind(controller)));

export default router;
