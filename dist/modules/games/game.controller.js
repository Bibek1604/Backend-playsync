"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getByCategory = exports.create = void 0;
const game_service_1 = require("./game.service");
const create = async (req, res) => {
    try {
        const game = await (0, game_service_1.createGame)(req.body);
        res.status(201).json(game);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.create = create;
const getByCategory = async (req, res) => {
    const games = await (0, game_service_1.getGamesByCategory)(req.params.categoryId);
    res.json(games);
};
exports.getByCategory = getByCategory;
//# sourceMappingURL=game.controller.js.map