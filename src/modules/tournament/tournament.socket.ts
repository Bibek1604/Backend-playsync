import { Server as SocketServer, Socket } from 'socket.io';
import Tournament, { TournamentStatus } from './tournament.model';
import Payment, { PaymentStatus } from '../payment/payment.model';
import mongoose from 'mongoose';
import logger from '../../Share/utils/logger';

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

export function initializeTournamentHandlers(io: SocketServer): void {
    io.on('connection', (socket: Socket) => {
        const user = (socket as any).user;
        if (!user) return;

        socket.on('tournament:join', async (data: { tournamentId: string }) => {
            try {
                const { tournamentId } = data;
                const userId = user.id;

                const tournament = await Tournament.findById(tournamentId)
                    .populate('adminId', 'fullName profilePicture')
                    .populate('participants', 'fullName profilePicture')
                    .lean();

                if (!tournament) {
                    socket.emit('tournament:error', { message: 'Tournament not found' });
                    return;
                }

                const isAdmin = tournament.adminId._id.toString() === userId.toString();
                const isParticipant = tournament.participants.some((p: any) => p._id.toString() === userId.toString());

                let hasAccess = isAdmin;

                if (!isAdmin && isParticipant) {
                    const payment = await Payment.findOne({
                        tournamentId: new mongoose.Types.ObjectId(tournamentId),
                        payerId: new mongoose.Types.ObjectId(userId),
                        status: PaymentStatus.SUCCESS
                    });
                    if (payment) hasAccess = true;
                }

                if (!hasAccess) {
                    socket.emit('tournament:error', { message: 'Payment required to access chat' });
                    return;
                }

                socket.join(`tournament:${tournamentId}`);

                // Send Participants
                socket.emit('tournament:participants', {
                    creator: {
                        _id: tournament.adminId._id,
                        fullName: (tournament.adminId as any).fullName,
                        avatar: (tournament.adminId as any).profilePicture
                    },
                    members: tournament.participants.map((p: any) => ({
                        _id: p._id,
                        fullName: p.fullName,
                        avatar: p.profilePicture
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
