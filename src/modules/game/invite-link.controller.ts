import { Request, Response, NextFunction } from 'express';
import { InviteLink } from './invite-link.model';
import Game from './game.model';
import { GameService } from './game.service';
import { getGameService } from './game.service.factory';
import { apiResponse } from '../../Share/utils/apiResponse';
import AppError from '../../Share/utils/AppError';
import crypto from 'crypto';

export class InviteLinkController {
    /**
     * POST /games/:id/invite
     * Generate a unique invite link for a game.
     */
    async generateInvite(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const gameId = req.params.id;
            const userId = (req as any).user?.id;

            const game = await Game.findById(gameId);
            if (!game) {
                throw new AppError('Game not found', 404);
            }

            if (game.creatorId.toString() !== userId) {
                throw new AppError('Only the game creator can generate invite links', 403);
            }

            if (game.status === 'ENDED' || game.status === 'CANCELLED') {
                throw new AppError('Cannot generate invite for ended or cancelled games', 400);
            }

            // Generate unique code (8-12 chars)
            const inviteCode = crypto.randomBytes(6).toString('hex'); // 12 chars

            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

            const inviteLink = await InviteLink.create({
                gameId,
                createdBy: userId,
                inviteCode,
                expiresAt,
                isActive: true,
            });

            res.status(201).json(
                apiResponse(true, 'Invite link generated successfully', {
                    inviteCode: inviteLink.inviteCode,
                    expiresAt: inviteLink.expiresAt,
                    inviteUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/invite/${inviteLink.inviteCode}`,
                })
            );
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /games/invite/:code
     * Validate invite and return game details.
     */
    async getInviteDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { code } = req.params;

            const invite = await InviteLink.findOne({ inviteCode: code, isActive: true }).populate('gameId');

            if (!invite) {
                throw new AppError('Invalid or expired invite link', 404);
            }

            if (new Date() > invite.expiresAt) {
                invite.isActive = false;
                await invite.save();
                throw new AppError('Invite link has expired', 410);
            }

            const game = invite.gameId as any;
            if (game.status !== 'OPEN') {
                throw new AppError('Game is no longer open for joining', 400);
            }

            res.status(200).json(
                apiResponse(true, 'Invite validated', {
                    inviteCode: invite.inviteCode,
                    game: {
                        id: game._id,
                        title: game.title,
                        description: game.description,
                        currentPlayers: game.currentPlayers,
                        maxPlayers: game.maxPlayers,
                        status: game.status,
                        imageUrl: game.imageUrl,
                    },
                })
            );
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /games/invite/:code/join
     * Join a game using an invite link.
     */
    async joinWithInvite(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { code } = req.params;
            const userId = (req as any).user?.id;

            const invite = await InviteLink.findOne({ inviteCode: code, isActive: true });

            if (!invite) {
                throw new AppError('Invalid or expired invite link', 404);
            }

            if (new Date() > invite.expiresAt) {
                invite.isActive = false;
                await invite.save();
                throw new AppError('Invite link has expired', 410);
            }

            const gameService = getGameService();
            const game = await gameService.joinGame(invite.gameId.toString(), userId);

            res.status(200).json(
                apiResponse(true, 'Successfully joined the game via invite', {
                    game: {
                        id: game._id,
                        title: game.title,
                        status: game.status,
                        currentPlayers: game.currentPlayers,
                        maxPlayers: game.maxPlayers,
                    },
                })
            );
        } catch (error) {
            next(error);
        }
    }
}
