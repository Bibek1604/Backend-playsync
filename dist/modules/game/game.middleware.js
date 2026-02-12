"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.checkUserNotParticipant = exports.checkUserIsParticipant = exports.checkGameJoinable = exports.checkGameEditable = exports.checkGameOwnership = void 0;
const game_repository_1 = require("./game.repository");
const AppError_1 = __importDefault(require("../../Share/utils/AppError"));
const game_types_1 = require("./game.types");
const gameRepository = new game_repository_1.GameRepository();
const checkGameOwnership = async (req, res, next) => {
    try {
        const gameId = req.params.id;
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError_1.default('Unauthorized', 401);
        }
        const game = await gameRepository.findById(gameId);
        if (!game) {
            throw new AppError_1.default('Game not found', 404);
        }
        if (game.creatorId.toString() !== userId) {
            throw new AppError_1.default('Forbidden: Only creator can perform this action', 403);
        }
        req.game = game;
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.checkGameOwnership = checkGameOwnership;
const checkGameEditable = async (req, res, next) => {
    try {
        const game = req.game;
        if (!game) {
            const gameId = req.params.id;
            const foundGame = await gameRepository.findById(gameId);
            if (!foundGame) {
                throw new AppError_1.default('Game not found', 404);
            }
            if (foundGame.status === game_types_1.GameStatus.ENDED) {
                throw new AppError_1.default('Cannot modify ended game', 409);
            }
            req.game = foundGame;
        }
        else {
            if (game.status === game_types_1.GameStatus.ENDED) {
                throw new AppError_1.default('Cannot modify ended game', 409);
            }
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.checkGameEditable = checkGameEditable;
const checkGameJoinable = async (req, res, next) => {
    try {
        const gameId = req.params.id;
        const game = await gameRepository.findById(gameId);
        if (!game) {
            throw new AppError_1.default('Game not found', 404);
        }
        if (game.status === game_types_1.GameStatus.ENDED) {
            throw new AppError_1.default('Cannot join ended game', 400);
        }
        if (game.status === game_types_1.GameStatus.FULL) {
            throw new AppError_1.default('Game is full', 400);
        }
        req.game = game;
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.checkGameJoinable = checkGameJoinable;
const checkUserIsParticipant = async (req, res, next) => {
    try {
        const gameId = req.params.id;
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError_1.default('Unauthorized', 401);
        }
        const isParticipant = await gameRepository.isUserParticipant(gameId, userId);
        if (!isParticipant) {
            throw new AppError_1.default('You are not a participant of this game', 400);
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.checkUserIsParticipant = checkUserIsParticipant;
const checkUserNotParticipant = async (req, res, next) => {
    try {
        const gameId = req.params.id;
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError_1.default('Unauthorized', 401);
        }
        const isParticipant = await gameRepository.isUserParticipant(gameId, userId);
        if (isParticipant) {
            throw new AppError_1.default('You have already joined this game', 400);
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.checkUserNotParticipant = checkUserNotParticipant;
const optionalAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (token) {
            const { verifyToken } = await Promise.resolve().then(() => __importStar(require('../../Share/config/jwt')));
            try {
                const payload = verifyToken(token);
                req.user = payload;
            }
            catch (error) {
            }
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=game.middleware.js.map