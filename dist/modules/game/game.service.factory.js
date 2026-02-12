"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGameService = exports.initializeGameService = void 0;
const game_service_1 = require("./game.service");
let gameServiceInstance = null;
const initializeGameService = (emitter) => {
    gameServiceInstance = new game_service_1.GameService(emitter);
};
exports.initializeGameService = initializeGameService;
const getGameService = () => {
    if (!gameServiceInstance) {
        gameServiceInstance = new game_service_1.GameService();
    }
    return gameServiceInstance;
};
exports.getGameService = getGameService;
//# sourceMappingURL=game.service.factory.js.map