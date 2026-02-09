"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameRepository = void 0;
const game_model_1 = __importDefault(require("./game.model"));
const game_types_1 = require("./game.types");
const mongoose_1 = __importDefault(require("mongoose"));
class GameRepository {
    async create(gameData) {
        const game = new game_model_1.default(gameData);
        return await game.save();
    }
    async findById(id) {
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return null;
        }
        return await game_model_1.default.findById(id);
    }
    async findByIdWithCreator(id) {
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return null;
        }
        return await game_model_1.default.findById(id).populate('creatorId', 'fullName email profilePicture');
    }
    async findByIdWithParticipants(id) {
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return null;
        }
        return await game_model_1.default.findById(id)
            .populate('creatorId', 'fullName email profilePicture')
            .populate('participants.userId', 'fullName email profilePicture');
    }
    async update(id, updateData) {
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return null;
        }
        return await game_model_1.default.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });
    }
    async delete(id) {
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return false;
        }
        const result = await game_model_1.default.findByIdAndDelete(id);
        return result !== null;
    }
    async findAll(filters, pagination) {
        const query = {};
        if (filters.category) {
            query.category = filters.category;
        }
        if (filters.status) {
            query.status = filters.status;
        }
        if (filters.creatorId) {
            query.creatorId = new mongoose_1.default.Types.ObjectId(filters.creatorId);
        }
        if (filters.search) {
            query.$text = { $search: filters.search };
        }
        const skip = (pagination.page - 1) * pagination.limit;
        const [games, total] = await Promise.all([
            game_model_1.default.find(query)
                .populate('creatorId', 'fullName email profilePicture')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(pagination.limit)
                .lean(),
            game_model_1.default.countDocuments(query)
        ]);
        return { games: games, total };
    }
    async findByCreator(creatorId, filters, pagination) {
        const query = { creatorId: new mongoose_1.default.Types.ObjectId(creatorId) };
        if (filters.category) {
            query.category = filters.category;
        }
        if (filters.status) {
            query.status = filters.status;
        }
        const skip = (pagination.page - 1) * pagination.limit;
        const [games, total] = await Promise.all([
            game_model_1.default.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(pagination.limit)
                .lean(),
            game_model_1.default.countDocuments(query)
        ]);
        return { games: games, total };
    }
    async findByParticipant(userId, filters, pagination) {
        const query = {
            'participants.userId': new mongoose_1.default.Types.ObjectId(userId),
            'participants.status': 'ACTIVE'
        };
        if (filters.category) {
            query.category = filters.category;
        }
        if (filters.status) {
            query.status = filters.status;
        }
        const skip = (pagination.page - 1) * pagination.limit;
        const [games, total] = await Promise.all([
            game_model_1.default.find(query)
                .populate('creatorId', 'fullName email profilePicture')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(pagination.limit)
                .lean(),
            game_model_1.default.countDocuments(query)
        ]);
        return { games: games, total };
    }
    async findExpiredGames(currentTime) {
        return await game_model_1.default.find({
            endTime: { $lte: currentTime },
            status: { $ne: game_types_1.GameStatus.ENDED }
        });
    }
    async addParticipant(gameId, userId) {
        if (!mongoose_1.default.Types.ObjectId.isValid(gameId) || !mongoose_1.default.Types.ObjectId.isValid(userId)) {
            return null;
        }
        const game = await game_model_1.default.findOneAndUpdate({
            _id: gameId,
            status: { $ne: game_types_1.GameStatus.ENDED },
            currentPlayers: { $lt: mongoose_1.default.connection.model('Game').schema.path('maxPlayers') },
            'participants.userId': { $ne: userId }
        }, {
            $push: {
                participants: {
                    userId: new mongoose_1.default.Types.ObjectId(userId),
                    joinedAt: new Date(),
                    status: 'ACTIVE'
                }
            },
            $inc: { currentPlayers: 1 }
        }, { new: true, runValidators: true });
        return game;
    }
    async removeParticipant(gameId, userId) {
        if (!mongoose_1.default.Types.ObjectId.isValid(gameId) || !mongoose_1.default.Types.ObjectId.isValid(userId)) {
            return null;
        }
        const game = await game_model_1.default.findById(gameId);
        if (!game)
            return null;
        const participant = game.participants.find(p => p.userId.toString() === userId && p.status === 'ACTIVE');
        if (!participant)
            return null;
        participant.status = 'LEFT';
        participant.leftAt = new Date();
        game.currentPlayers = Math.max(0, game.currentPlayers - 1);
        if (game.status === game_types_1.GameStatus.FULL && game.currentPlayers < game.maxPlayers) {
            game.status = game_types_1.GameStatus.OPEN;
        }
        await game.save();
        return game;
    }
    async isUserParticipant(gameId, userId) {
        if (!mongoose_1.default.Types.ObjectId.isValid(gameId) || !mongoose_1.default.Types.ObjectId.isValid(userId)) {
            return false;
        }
        const game = await game_model_1.default.findOne({
            _id: gameId,
            'participants.userId': new mongoose_1.default.Types.ObjectId(userId),
            'participants.status': 'ACTIVE'
        });
        return game !== null;
    }
}
exports.GameRepository = GameRepository;
//# sourceMappingURL=game.repository.js.map