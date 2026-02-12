"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameEventsEmitter = exports.GameEvent = void 0;
var GameEvent;
(function (GameEvent) {
    GameEvent["GAME_CREATED"] = "game:created";
    GameEvent["GAME_UPDATED"] = "game:updated";
    GameEvent["GAME_DELETED"] = "game:deleted";
    GameEvent["GAME_STATUS_CHANGED"] = "game:status:changed";
    GameEvent["PLAYER_JOINED"] = "game:player:joined";
    GameEvent["PLAYER_LEFT"] = "game:player:left";
    GameEvent["SLOTS_UPDATED"] = "game:slots:updated";
    GameEvent["MEMBER_REMOVED"] = "game:member:removed";
    GameEvent["MEMBER_BANNED"] = "game:member:banned";
    GameEvent["OWNERSHIP_TRANSFERRED"] = "game:ownership:transferred";
})(GameEvent || (exports.GameEvent = GameEvent = {}));
class GameEventsEmitter {
    constructor(io) {
        this.io = io;
    }
    emitGameStatusChange(gameId, status, availableSlots) {
        this.io.to(`game:${gameId}`).emit(GameEvent.GAME_STATUS_CHANGED, {
            gameId,
            status,
            availableSlots,
            timestamp: new Date()
        });
        this.io.to('discovery').emit(GameEvent.GAME_UPDATED, {
            gameId,
            status,
            availableSlots
        });
    }
    emitPlayerJoined(gameId, player, currentPlayers, availableSlots) {
        this.io.to(`game:${gameId}`).emit(GameEvent.PLAYER_JOINED, {
            gameId,
            player,
            currentPlayers,
            availableSlots,
            timestamp: new Date()
        });
        this.io.to('discovery').emit(GameEvent.SLOTS_UPDATED, {
            gameId,
            currentPlayers,
            availableSlots
        });
    }
    emitPlayerLeft(gameId, playerId, currentPlayers, availableSlots) {
        this.io.to(`game:${gameId}`).emit(GameEvent.PLAYER_LEFT, {
            gameId,
            playerId,
            currentPlayers,
            availableSlots,
            timestamp: new Date()
        });
        this.io.to('discovery').emit(GameEvent.SLOTS_UPDATED, {
            gameId,
            currentPlayers,
            availableSlots
        });
    }
    emitGameCreated(gameId, gameData) {
        this.io.to('discovery').emit(GameEvent.GAME_CREATED, {
            gameId,
            game: gameData,
            timestamp: new Date()
        });
    }
    emitGameDeleted(gameId) {
        this.io.to('discovery').emit(GameEvent.GAME_DELETED, {
            gameId,
            timestamp: new Date()
        });
        this.io.in(`game:${gameId}`).socketsLeave(`game:${gameId}`);
    }
    emitGameUpdated(gameId, updateData) {
        this.io.to(`game:${gameId}`).emit(GameEvent.GAME_UPDATED, {
            gameId,
            updates: updateData,
            timestamp: new Date()
        });
        this.io.to('discovery').emit(GameEvent.GAME_UPDATED, {
            gameId,
            updates: updateData
        });
    }
    emitMemberRemoved(gameId, userId, removedBy, reason) {
        this.io.to(`game:${gameId}`).emit(GameEvent.MEMBER_REMOVED, {
            gameId,
            userId,
            removedBy,
            reason,
            timestamp: new Date()
        });
        this.io.to(`user:${userId}`).emit(GameEvent.MEMBER_REMOVED, {
            gameId,
            reason,
            message: 'You have been removed from the game'
        });
    }
    emitMemberBanned(gameId, userId, bannedBy, reason) {
        this.io.to(`game:${gameId}`).emit(GameEvent.MEMBER_BANNED, {
            gameId,
            userId,
            bannedBy,
            reason,
            timestamp: new Date()
        });
        this.io.to(`user:${userId}`).emit(GameEvent.MEMBER_BANNED, {
            gameId,
            reason,
            message: 'You have been banned from this game'
        });
    }
    emitOwnershipTransferred(gameId, fromUserId, toUserId) {
        this.io.to(`game:${gameId}`).emit(GameEvent.OWNERSHIP_TRANSFERRED, {
            gameId,
            fromUserId,
            toUserId,
            timestamp: new Date()
        });
        this.io.to(`user:${toUserId}`).emit(GameEvent.OWNERSHIP_TRANSFERRED, {
            gameId,
            message: 'You are now the owner of this game'
        });
    }
}
exports.GameEventsEmitter = GameEventsEmitter;
//# sourceMappingURL=game.events.js.map