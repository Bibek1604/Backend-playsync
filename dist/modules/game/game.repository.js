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
            status: { $nin: [game_types_1.GameStatus.ENDED, game_types_1.GameStatus.FULL] },
            $expr: { $lt: ['$currentPlayers', '$maxPlayers'] },
            'participants': {
                $not: {
                    $elemMatch: {
                        userId: new mongoose_1.default.Types.ObjectId(userId),
                        status: 'ACTIVE'
                    }
                }
            }
        }, {
            $push: {
                participants: {
                    userId: new mongoose_1.default.Types.ObjectId(userId),
                    joinedAt: new Date(),
                    status: 'ACTIVE'
                }
            },
            $inc: { currentPlayers: 1 }
        }, {
            new: true,
            runValidators: true,
            populate: { path: 'creatorId', select: 'fullName email profilePicture' }
        });
        if (game && game.currentPlayers >= game.maxPlayers) {
            game.status = game_types_1.GameStatus.FULL;
            await game.save();
        }
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
            'participants': {
                $elemMatch: {
                    userId: new mongoose_1.default.Types.ObjectId(userId),
                    status: 'ACTIVE'
                }
            }
        }).select('_id');
        return game !== null;
    }
    async canUserJoinGame(gameId, userId) {
        const game = await game_model_1.default.findById(gameId);
        if (!game) {
            return { canJoin: false, reasons: ['Game not found'] };
        }
        const reasons = [];
        if (game.status === game_types_1.GameStatus.ENDED) {
            reasons.push('Game has ended');
        }
        if (game.currentPlayers >= game.maxPlayers) {
            reasons.push('Game is full');
        }
        const isParticipant = game.participants.some(p => p.userId.toString() === userId && p.status === 'ACTIVE');
        if (isParticipant) {
            reasons.push('Already joined this game');
        }
        return {
            canJoin: reasons.length === 0,
            reasons,
            game
        };
    }
    async findAllWithAdvancedFilters(filters, pagination) {
        const query = this.buildDiscoveryQuery(filters);
        const sort = this.buildSortQuery(filters.sortBy, filters.sortOrder);
        const skip = (pagination.page - 1) * pagination.limit;
        const [games, total] = await Promise.all([
            game_model_1.default.find(query)
                .select('-participants -metadata')
                .populate('creatorId', 'fullName email profilePicture')
                .sort(sort)
                .skip(skip)
                .limit(pagination.limit)
                .lean(),
            game_model_1.default.countDocuments(query)
        ]);
        return { games: games, total };
    }
    buildDiscoveryQuery(filters) {
        const query = {};
        if (filters.status)
            query.status = filters.status;
        if (filters.category)
            query.category = filters.category;
        if (filters.availableSlots) {
            query.$expr = { $lt: ['$currentPlayers', '$maxPlayers'] };
            if (!filters.status) {
                query.status = game_types_1.GameStatus.OPEN;
            }
        }
        if (filters.minPlayers || filters.maxPlayers) {
            query.maxPlayers = {};
            if (filters.minPlayers)
                query.maxPlayers.$gte = filters.minPlayers;
            if (filters.maxPlayers)
                query.maxPlayers.$lte = filters.maxPlayers;
        }
        if (filters.startTimeFrom || filters.startTimeTo) {
            query.startTime = {};
            if (filters.startTimeFrom)
                query.startTime.$gte = filters.startTimeFrom;
            if (filters.startTimeTo)
                query.startTime.$lte = filters.startTimeTo;
        }
        if (filters.search) {
            query.$text = { $search: filters.search };
        }
        if (filters.creatorId) {
            query.creatorId = new mongoose_1.default.Types.ObjectId(filters.creatorId);
        }
        if (!filters.includeEnded) {
            if (query.status) {
                if (query.status !== game_types_1.GameStatus.ENDED) {
                }
                else {
                }
            }
            else {
                query.status = { $ne: game_types_1.GameStatus.ENDED };
            }
        }
        return query;
    }
    buildSortQuery(sortBy, sortOrder = 'desc') {
        const order = sortOrder === 'asc' ? 1 : -1;
        switch (sortBy) {
            case 'startTime':
                return { startTime: order };
            case 'endTime':
                return { endTime: order };
            case 'popularity':
                return { currentPlayers: order, createdAt: -1 };
            case 'createdAt':
            default:
                return { createdAt: order };
        }
    }
}
exports.GameRepository = GameRepository;
//# sourceMappingURL=game.repository.js.map