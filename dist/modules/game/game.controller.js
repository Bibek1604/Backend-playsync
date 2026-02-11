"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameController = void 0;
const apiResponse_1 = require("../../Share/utils/apiResponse");
const game_service_factory_1 = require("./game.service.factory");
class GameController {
    async create(req, res, next) {
        try {
            const gameService = (0, game_service_factory_1.getGameService)();
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
            const gameService = (0, game_service_factory_1.getGameService)();
            const filters = {
                category: req.query.category,
                status: req.query.status,
                creatorId: req.query.creatorId,
                search: req.query.search,
                availableSlots: req.query.availableSlots === 'true',
                minPlayers: req.query.minPlayers ? parseInt(req.query.minPlayers) : undefined,
                maxPlayers: req.query.maxPlayers ? parseInt(req.query.maxPlayers) : undefined,
                startTimeFrom: req.query.startTimeFrom ? new Date(req.query.startTimeFrom) : undefined,
                startTimeTo: req.query.startTimeTo ? new Date(req.query.startTimeTo) : undefined,
                includeEnded: req.query.includeEnded === 'true',
                sortBy: req.query.sortBy,
                sortOrder: req.query.sortOrder
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
            const gameService = (0, game_service_factory_1.getGameService)();
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
            const gameService = (0, game_service_factory_1.getGameService)();
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
            const gameService = (0, game_service_factory_1.getGameService)();
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
            const gameService = (0, game_service_factory_1.getGameService)();
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
            const gameService = (0, game_service_factory_1.getGameService)();
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
            const gameService = (0, game_service_factory_1.getGameService)();
            const gameId = req.params.id;
            const userId = req.user?.id;
            const game = await gameService.joinGame(gameId, userId);
            res.status(200).json((0, apiResponse_1.apiResponse)(true, 'Successfully joined the game', {
                game: {
                    id: game._id,
                    title: game.title,
                    status: game.status,
                    currentPlayers: game.currentPlayers,
                    maxPlayers: game.maxPlayers,
                    availableSlots: game.maxPlayers - game.currentPlayers
                }
            }));
        }
        catch (error) {
            next(error);
        }
    }
    async leave(req, res, next) {
        try {
            const gameService = (0, game_service_factory_1.getGameService)();
            const gameId = req.params.id;
            const userId = req.user?.id;
            const game = await gameService.leaveGame(gameId, userId);
            res.status(200).json((0, apiResponse_1.apiResponse)(true, 'Successfully left the game', {
                game: {
                    id: game._id,
                    status: game.status,
                    currentPlayers: game.currentPlayers,
                    maxPlayers: game.maxPlayers,
                    availableSlots: game.maxPlayers - game.currentPlayers
                }
            }));
        }
        catch (error) {
            next(error);
        }
    }
    async canJoin(req, res, next) {
        try {
            const gameService = (0, game_service_factory_1.getGameService)();
            const gameId = req.params.id;
            const userId = req.user?.id;
            const eligibility = await gameService.checkJoinEligibility(gameId, userId);
            res.status(200).json((0, apiResponse_1.apiResponse)(true, 'Join eligibility checked', eligibility));
        }
        catch (error) {
            next(error);
        }
    }
}
exports.GameController = GameController;
//# sourceMappingURL=game.controller.js.map