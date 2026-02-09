"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameController = void 0;
const game_service_1 = require("./game.service");
const apiResponse_1 = require("../../Share/utils/apiResponse");
const gameService = new game_service_1.GameService();
class GameController {
    async create(req, res, next) {
        try {
            const userId = req.user?.id;
            const gameData = req.body;
            const imageFile = req.file;
            const game = await gameService.createGame(userId, gameData, imageFile);
            res.status(201).json((0, apiResponse_1.apiResponse)(true, 'Game created successfully', {
                game
            }));
        }
        catch (error) {
            next(error);
        }
    }
    async getAll(req, res, next) {
        try {
            const filters = {
                category: req.query.category,
                status: req.query.status,
                creatorId: req.query.creatorId,
                search: req.query.search
            };
            const pagination = {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 20
            };
            const result = await gameService.getAllGames(filters, pagination);
            res.status(200).json((0, apiResponse_1.apiResponse)(true, 'Games retrieved successfully', result));
        }
        catch (error) {
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            const gameId = req.params.id;
            const includeDetails = req.query.details === 'true';
            const game = await gameService.getGameById(gameId, includeDetails);
            res.status(200).json((0, apiResponse_1.apiResponse)(true, 'Game retrieved successfully', { game }));
        }
        catch (error) {
            next(error);
        }
    }
    async getMyCreatedGames(req, res, next) {
        try {
            const userId = req.user?.id;
            const filters = {
                category: req.query.category,
                status: req.query.status
            };
            const pagination = {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 20
            };
            const result = await gameService.getMyCreatedGames(userId, filters, pagination);
            res.status(200).json((0, apiResponse_1.apiResponse)(true, 'Created games retrieved successfully', result));
        }
        catch (error) {
            next(error);
        }
    }
    async getMyJoinedGames(req, res, next) {
        try {
            const userId = req.user?.id;
            const filters = {
                category: req.query.category,
                status: req.query.status
            };
            const pagination = {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 20
            };
            const result = await gameService.getMyJoinedGames(userId, filters, pagination);
            res.status(200).json((0, apiResponse_1.apiResponse)(true, 'Joined games retrieved successfully', result));
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const gameId = req.params.id;
            const userId = req.user?.id;
            const updateData = req.body;
            const imageFile = req.file;
            const game = await gameService.updateGame(gameId, userId, updateData, imageFile);
            res.status(200).json((0, apiResponse_1.apiResponse)(true, 'Game updated successfully', { game }));
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            const gameId = req.params.id;
            const userId = req.user?.id;
            await gameService.deleteGame(gameId, userId);
            res.status(200).json((0, apiResponse_1.apiResponse)(true, 'Game deleted successfully'));
        }
        catch (error) {
            next(error);
        }
    }
    async join(req, res, next) {
        try {
            const gameId = req.params.id;
            const userId = req.user?.id;
            const game = await gameService.joinGame(gameId, userId);
            res.status(200).json((0, apiResponse_1.apiResponse)(true, 'Successfully joined the game', {
                gameId: game._id,
                currentPlayers: game.currentPlayers,
                status: game.status
            }));
        }
        catch (error) {
            next(error);
        }
    }
    async leave(req, res, next) {
        try {
            const gameId = req.params.id;
            const userId = req.user?.id;
            const game = await gameService.leaveGame(gameId, userId);
            res.status(200).json((0, apiResponse_1.apiResponse)(true, 'Successfully left the game', {
                gameId: game._id,
                currentPlayers: game.currentPlayers,
                status: game.status
            }));
        }
        catch (error) {
            next(error);
        }
    }
}
exports.GameController = GameController;
//# sourceMappingURL=game.controller.js.map