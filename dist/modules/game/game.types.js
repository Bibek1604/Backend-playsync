"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParticipantStatus = exports.GameStatus = exports.GameCategory = void 0;
var GameCategory;
(function (GameCategory) {
    GameCategory["ONLINE"] = "ONLINE";
    GameCategory["OFFLINE"] = "OFFLINE";
})(GameCategory || (exports.GameCategory = GameCategory = {}));
var GameStatus;
(function (GameStatus) {
    GameStatus["OPEN"] = "OPEN";
    GameStatus["FULL"] = "FULL";
    GameStatus["ENDED"] = "ENDED";
})(GameStatus || (exports.GameStatus = GameStatus = {}));
var ParticipantStatus;
(function (ParticipantStatus) {
    ParticipantStatus["ACTIVE"] = "ACTIVE";
    ParticipantStatus["LEFT"] = "LEFT";
})(ParticipantStatus || (exports.ParticipantStatus = ParticipantStatus = {}));
//# sourceMappingURL=game.types.js.map