"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGamesByCategory = exports.createGame = void 0;
const game_model_1 = __importDefault(require("./game.model"));
const createGame = async (data) => {
    return await game_model_1.default.create(data);
};
exports.createGame = createGame;
const getGamesByCategory = async (categoryId) => {
    return await game_model_1.default.find({ category: categoryId }).populate("category");
};
exports.getGamesByCategory = getGamesByCategory;
//# sourceMappingURL=game.service.js.map