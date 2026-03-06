import { Server as SocketServer, Socket } from 'socket.io';
import { Tournament } from './tournament.model';
import mongoose from 'mongoose';
import logger from '../../Share/utils/logger';
import { TournamentService } from './tournament.service';

// Tournament Chat Message structure
interface TournamentMessage {
    _id: string;
    userId: { _id: string; fullName: string; avatar?: string };
    content: string;
    createdAt: string;
}

// In-memory message store for tournaments (Since we don't have a DB schema for tournament messages yet, we can either use the existing chat schema or keep it simple in memory for now, or just build a quick mongoose model).
// A proper implementation should use a database schema, but for completion of this task let's create a lightweight model or reuse chat.
import { Schema, model, models } from 'mongoose';

const tournamentMessageSchema = new Schema({
    tournamentId: { type: Schema.Types.ObjectId, ref: 'Tournament', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
}, { timestamps: true });

const TournamentMessage = models.TournamentMessage || model('TournamentMessage', tournamentMessageSchema);
const tournamentService = new TournamentService();

export function initializeTournamentHandlers(io: SocketServer): void {
    io.on('connection', (socket: Socket) => {
        const user = (socket as any).user;
        if (!user) return;

        socket.on('tournament:join', async (data: { tournamentId: string }) => {
            try {
                const { tournamentId } = data;
                const userId = user.id;

                const tournament = await Tournament.findById(tournamentId)
                    .populate('creatorId', 'fullName profilePicture avatar')
                    .populate('participants.userId', 'fullName profilePicture avatar')
                    .lean();

                if (!tournament) {
                    socket.emit('tournament:error', { message: 'Tournament not found' });
                    return;
                }

                const hasAccess = await tournamentService.canAccessChat(tournamentId, userId);

                if (!hasAccess) {
                    socket.emit('tournament:error', { message: 'Only tournament participants can access chat' });
                    return;
                }

                socket.join(`tournament:${tournamentId}`);

                // Send Participants
                socket.emit('tournament:participants', {
                    creator: {
                        _id: (tournament.creatorId as any)?._id,
                        fullName: (tournament.creatorId as any)?.fullName,
                        avatar: (tournament.creatorId as any)?.profilePicture || (tournament.creatorId as any)?.avatar
                    },
                    members: (tournament.participants || []).map((p: any) => ({
                        _id: p?.userId?._id,
                        fullName: p?.userId?.fullName,
                        avatar: p?.userId?.profilePicture || p?.userId?.avatar,
                        joinedAt: p?.joinedAt,
                    }))
                });

                // Send History
                const history = await TournamentMessage.find({ tournamentId: new mongoose.Types.ObjectId(tournamentId) })
                    .populate('userId', 'fullName profilePicture')
                    .sort({ createdAt: 1 })
                    .limit(100)
                    .lean();

                socket.emit('tournament:history', history.map((msg: any) => ({
                    _id: msg._id,
                    userId: msg.userId,
                    content: msg.content,
                    createdAt: msg.createdAt
                })));

            } catch (error) {
                logger.error(`Tournament join error: ${error}`);
            }
        });

        socket.on('tournament:send', async (data: { tournamentId: string, content: string }) => {
            try {
                const { tournamentId, content } = data;
                const userId = user.id;

                // Save
                const msg = await TournamentMessage.create({
                    tournamentId: new mongoose.Types.ObjectId(tournamentId),
                    userId: new mongoose.Types.ObjectId(userId),
                    content
                });

                const populatedMsg = await TournamentMessage.findById(msg._id).populate('userId', 'fullName profilePicture').lean();

                io.to(`tournament:${tournamentId}`).emit('tournament:message', {
                    _id: populatedMsg._id,
                    userId: populatedMsg.userId,
                    content: populatedMsg.content,
                    createdAt: populatedMsg.createdAt
                });

            } catch (error) {
                logger.error(`Tournament send error: ${error}`);
            }
        });
    });
}
