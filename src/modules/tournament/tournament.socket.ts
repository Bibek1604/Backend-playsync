/**
 * Tournament Chat - Socket.IO Handler
 * Payment-gated real-time chat for tournaments
 */

import { Server as SocketServer, Socket } from 'socket.io';
import { TournamentMessage } from './tournament-message.model';
import { TournamentService } from './tournament.service';
import logger from '../../Share/utils/logger';

const tournamentService = new TournamentService();

export function initializeTournamentChatHandlers(io: SocketServer): void {
  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    if (!user) return;

    // ── Join room ─────────────────────────────────────────────────
    socket.on('tournament:join', async ({ tournamentId }: { tournamentId: string }) => {
      try {
        const allowed = await tournamentService.canAccessChat(tournamentId, user.id);
        if (!allowed) {
          socket.emit('tournament:error', { message: 'Payment required to access chat.' });
          return;
        }

        socket.join(`tournament:${tournamentId}`);

        // Send last 100 messages as history
        const history = await TournamentMessage.find({ tournamentId })
          .sort({ createdAt: 1 })
          .limit(100)
          .populate('userId', 'username avatar')
          .lean();

        socket.emit('tournament:history', history);
        logger.info(`User ${user.id} joined tournament chat: ${tournamentId}`);
      } catch (err: any) {
        logger.error(`tournament:join error: ${err.message}`);
        socket.emit('tournament:error', { message: 'Could not join tournament chat.' });
      }
    });

    // ── Send message ──────────────────────────────────────────────
    socket.on('tournament:send', async ({ tournamentId, content }: { tournamentId: string; content: string }) => {
      try {
        if (!content?.trim()) return;

        const allowed = await tournamentService.canAccessChat(tournamentId, user.id);
        if (!allowed) {
          socket.emit('tournament:error', { message: 'Payment required to send messages.' });
          return;
        }

        const msg = await TournamentMessage.create({
          tournamentId,
          userId: user.id,
          content: content.trim().slice(0, 1500),
        });

        const populated = await TournamentMessage.findById(msg._id)
          .populate('userId', 'username avatar')
          .lean();

        io.to(`tournament:${tournamentId}`).emit('tournament:message', populated);
      } catch (err: any) {
        logger.error(`tournament:send error: ${err.message}`);
        socket.emit('tournament:error', { message: 'Could not send message.' });
      }
    });

    // ── Leave room ────────────────────────────────────────────────
    socket.on('tournament:leave', ({ tournamentId }: { tournamentId: string }) => {
      socket.leave(`tournament:${tournamentId}`);
    });
  });
}
