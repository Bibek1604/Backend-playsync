"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameService = void 0;
const game_repository_1 = require("./game.repository");
const AppError_1 = __importDefault(require("../../Share/utils/AppError"));
const game_uploader_1 = require("./game.uploader");
const game_types_1 = require("./game.types");
class GameService {
    constructor() {
        this.gameRepository = new game_repository_1.GameRepository();
    }
    async createGame(creatorId, data, imageFile) {
        let imageUrl;
        let imagePublicId;
        if (imageFile) {
            try {
                const uploadResult = await (0, game_uploader_1.uploadToCloudinary)(imageFile.buffer, 'games');
                imageUrl = uploadResult.url;
                imagePublicId = uploadResult.publicId;
            }
            catch (error) {
                throw new AppError_1.default('Failed to upload game image', 500);
            }
        }
        const gameData = {
            ...data,
            creatorId,
            imageUrl,
            imagePublicId,
            currentPlayers: 0,
            status: game_types_1.GameStatus.OPEN,
            startTime: new Date()
        };
        try {
            const game = await this.gameRepository.create(gameData);
            return game;
        }
        catch (error) {
            if (imagePublicId) {
                await (0, game_uploader_1.deleteFromCloudinary)(imagePublicId);
            }
            throw new AppError_1.default(error.message || 'Failed to create game', 500);
        }
    }
    async getGameById(gameId, includeDetails = false) {
        const game = includeDetails
            ? await this.gameRepository.findByIdWithParticipants(gameId)
            : await this.gameRepository.findByIdWithCreator(gameId);
        if (!game) {
            throw new AppError_1.default('Game not found', 404);
        }
        return game;
    }
    async getAllGames(filters, pagination) {
        const { games, total } = await this.gameRepository.findAll(filters, pagination);
        return {
            games,
            pagination: {
                page: pagination.page,
                limit: pagination.limit,
                total,
                totalPages: Math.ceil(total / pagination.limit)
            }
        };
    }
    async getMyCreatedGames(creatorId, filters, pagination) {
        const { games, total } = await this.gameRepository.findByCreator(creatorId, filters, pagination);
        return {
            games,
            pagination: {
                page: pagination.page,
                limit: pagination.limit,
                total,
                totalPages: Math.ceil(total / pagination.limit)
            }
        };
    }
    async getMyJoinedGames(userId, filters, pagination) {
        const { games, total } = await this.gameRepository.findByParticipant(userId, filters, pagination);
        return {
            games,
            pagination: {
                page: pagination.page,
                limit: pagination.limit,
                total,
                totalPages: Math.ceil(total / pagination.limit)
            }
        };
    }
    async updateGame(gameId, creatorId, data, imageFile) {
        const game = await this.gameRepository.findById(gameId);
        if (!game) {
            throw new AppError_1.default('Game not found', 404);
        }
        if (game.creatorId.toString() !== creatorId) {
            throw new AppError_1.default('Forbidden: Only creator can update this game', 403);
        }
        if (game.status === game_types_1.GameStatus.ENDED) {
            throw new AppError_1.default('Cannot update ended game', 409);
        }
        if (data.maxPlayers && data.maxPlayers < game.currentPlayers) {
            throw new AppError_1.default(`Cannot reduce max players below current players (${game.currentPlayers})`, 400);
        }
        if (data.endTime && data.endTime < game.endTime) {
            throw new AppError_1.default('Cannot shorten game end time', 400);
        }
        let imageUrl = game.imageUrl;
        let imagePublicId = game.imagePublicId;
        if (imageFile) {
            try {
                const uploadResult = await (0, game_uploader_1.uploadToCloudinary)(imageFile.buffer, 'games');
                imageUrl = uploadResult.url;
                imagePublicId = uploadResult.publicId;
                if (game.imagePublicId) {
                    await (0, game_uploader_1.deleteFromCloudinary)(game.imagePublicId);
                }
            }
            catch (error) {
                throw new AppError_1.default('Failed to upload new game image', 500);
            }
        }
        const updateData = {
            ...data,
            imageUrl,
            imagePublicId
        };
        const updatedGame = await this.gameRepository.update(gameId, updateData);
        if (!updatedGame) {
            throw new AppError_1.default('Failed to update game', 500);
        }
        return updatedGame;
    }
    async deleteGame(gameId, creatorId) {
        const game = await this.gameRepository.findById(gameId);
        if (!game) {
            throw new AppError_1.default('Game not found', 404);
        }
        if (game.creatorId.toString() !== creatorId) {
            throw new AppError_1.default('Forbidden: Only creator can delete this game', 403);
        }
        if (game.imagePublicId) {
            await (0, game_uploader_1.deleteFromCloudinary)(game.imagePublicId);
        }
        const deleted = await this.gameRepository.delete(gameId);
        if (!deleted) {
            throw new AppError_1.default('Failed to delete game', 500);
        }
    }
    async joinGame(gameId, userId) {
        const game = await this.gameRepository.findById(gameId);
        if (!game) {
            throw new AppError_1.default('Game not found', 404);
        }
        if (game.status === game_types_1.GameStatus.ENDED) {
            throw new AppError_1.default('Cannot join ended game', 400);
        }
        if (game.status === game_types_1.GameStatus.FULL) {
            throw new AppError_1.default('Game is full', 400);
        }
        const isParticipant = await this.gameRepository.isUserParticipant(gameId, userId);
        if (isParticipant) {
            throw new AppError_1.default('You have already joined this game', 400);
        }
        const updatedGame = await this.gameRepository.addParticipant(gameId, userId);
        if (!updatedGame) {
            throw new AppError_1.default('Failed to join game. Game might be full or ended.', 400);
        }
        if (updatedGame.currentPlayers >= updatedGame.maxPlayers) {
            updatedGame.status = game_types_1.GameStatus.FULL;
            await updatedGame.save();
        }
        return updatedGame;
    }
    async leaveGame(gameId, userId) {
        const game = await this.gameRepository.findById(gameId);
        if (!game) {
            throw new AppError_1.default('Game not found', 404);
        }
        if (game.status === game_types_1.GameStatus.ENDED) {
            throw new AppError_1.default('Cannot leave ended game', 400);
        }
        const isParticipant = await this.gameRepository.isUserParticipant(gameId, userId);
        if (!isParticipant) {
            throw new AppError_1.default('You are not a participant of this game', 400);
        }
        const updatedGame = await this.gameRepository.removeParticipant(gameId, userId);
        if (!updatedGame) {
            throw new AppError_1.default('Failed to leave game', 500);
        }
        return updatedGame;
    }
    async endGame(gameId) {
        const game = await this.gameRepository.findById(gameId);
        if (!game || game.status === game_types_1.GameStatus.ENDED) {
            return;
        }
        await this.gameRepository.update(gameId, {
            status: game_types_1.GameStatus.ENDED,
            endedAt: new Date()
        });
    }
    async endExpiredGames() {
        const currentTime = new Date();
        const expiredGames = await this.gameRepository.findExpiredGames(currentTime);
        for (const game of expiredGames) {
            await this.endGame(game._id.toString());
        }
        return expiredGames.length;
    }
}
exports.GameService = GameService;
//# sourceMappingURL=game.service.js.map