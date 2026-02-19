import { Request, Response } from 'express';
import { GameInvitation } from './game-invitation.model';
import { gameCapacityManager } from './game-capacity.manager';
import { Types } from 'mongoose';

export class GameInvitationController {
  /**
   * POST /games/:gameId/invite
   * Host invites a user to join their game.
   */
  static async sendInvitation(req: Request, res: Response): Promise<void> {
    try {
      const { gameId } = req.params;
      const { invitedUserId, message } = req.body;
      const invitedBy = (req as any).user?.id;

      if (!invitedUserId) {
        res.status(400).json({ success: false, message: 'invitedUserId is required.' });
        return;
      }

      const existing = await GameInvitation.findOne({ gameId, invitedUser: invitedUserId });
      if (existing) {
        res.status(409).json({ success: false, message: 'User already invited to this game.' });
        return;
      }

      const check = await gameCapacityManager.canJoin(gameId, invitedUserId);
      if (!check.allowed) {
        res.status(400).json({ success: false, message: `Cannot invite: ${check.reason}` });
        return;
      }

      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const invitation = await GameInvitation.create({
        gameId: new Types.ObjectId(gameId),
        invitedBy: new Types.ObjectId(invitedBy),
        invitedUser: new Types.ObjectId(invitedUserId),
        message,
        expiresAt,
      });

      res.status(201).json({ success: true, data: invitation });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * PUT /invitations/:invitationId/respond
   * Invited user accepts or declines.
   */
  static async respondToInvitation(req: Request, res: Response): Promise<void> {
    try {
      const { invitationId } = req.params;
      const { action } = req.body; // 'accept' | 'decline'
      const userId = (req as any).user?.id;

      const invitation = await GameInvitation.findOne({
        _id: invitationId,
        invitedUser: userId,
        status: 'pending',
      });

      if (!invitation) {
        res.status(404).json({ success: false, message: 'Invitation not found or already responded.' });
        return;
      }

      if (new Date() > invitation.expiresAt) {
        await GameInvitation.updateOne({ _id: invitationId }, { status: 'expired' });
        res.status(410).json({ success: false, message: 'Invitation has expired.' });
        return;
      }

      if (action === 'accept') {
        const joined = await gameCapacityManager.atomicJoin(invitation.gameId.toString(), userId);
        if (!joined) {
          res.status(409).json({ success: false, message: 'Game is full or no longer available.' });
          return;
        }
        invitation.status = 'accepted';
      } else {
        invitation.status = 'declined';
      }

      invitation.respondedAt = new Date();
      await invitation.save();

      res.status(200).json({ success: true, data: invitation });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * GET /users/me/invitations
   */
  static async getMyInvitations(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const invitations = await GameInvitation.find({ invitedUser: userId, status: 'pending' })
        .populate('gameId', 'title sportType scheduledAt')
        .populate('invitedBy', 'name profileImage')
        .sort({ createdAt: -1 });

      res.status(200).json({ success: true, data: invitations });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}
