import { Router } from 'express';
import { GameInvitationController } from './game-invitation.controller';

const router = Router();

// Invitations
router.post('/:gameId/invite', GameInvitationController.sendInvitation);
router.get('/me/invitations', GameInvitationController.getMyInvitations);
router.put('/invitations/:invitationId/respond', GameInvitationController.respondToInvitation);

export default router;
