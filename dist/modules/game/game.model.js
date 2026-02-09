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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const game_types_1 = require("./game.types");
const participantSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    joinedAt: {
        type: Date,
        default: Date.now
    },
    leftAt: {
        type: Date,
        default: null
    },
    status: {
        type: String,
        enum: Object.values(game_types_1.ParticipantStatus),
        default: game_types_1.ParticipantStatus.ACTIVE
    }
}, { _id: true });
const gameSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, 'Game title is required'],
        trim: true,
        minlength: [3, 'Title must be at least 3 characters'],
        maxlength: [255, 'Title must not exceed 255 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [2000, 'Description must not exceed 2000 characters'],
        default: ''
    },
    category: {
        type: String,
        enum: Object.values(game_types_1.GameCategory),
        required: [true, 'Game category is required']
    },
    imageUrl: {
        type: String,
        default: null
    },
    imagePublicId: {
        type: String,
        default: null
    },
    maxPlayers: {
        type: Number,
        required: [true, 'Maximum players is required'],
        min: [1, 'Max players must be at least 1'],
        max: [1000, 'Max players cannot exceed 1000']
    },
    currentPlayers: {
        type: Number,
        default: 0,
        min: [0, 'Current players cannot be negative']
    },
    status: {
        type: String,
        enum: Object.values(game_types_1.GameStatus),
        default: game_types_1.GameStatus.OPEN
    },
    creatorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Creator ID is required']
    },
    participants: {
        type: [participantSchema],
        default: []
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: {
        type: Date,
        required: [true, 'End time is required'],
        validate: {
            validator: function (value) {
                const doc = this;
                return value > doc.startTime;
            },
            message: 'End time must be after start time'
        }
    },
    endedAt: {
        type: Date,
        default: null
    },
    metadata: {
        type: mongoose_1.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
gameSchema.index({ status: 1 });
gameSchema.index({ creatorId: 1 });
gameSchema.index({ category: 1 });
gameSchema.index({ endTime: 1, status: 1 });
gameSchema.index({ 'participants.userId': 1 });
gameSchema.index({ title: 'text', description: 'text' });
gameSchema.index({ status: 1, endTime: 1 }, {
    partialFilterExpression: { status: { $in: [game_types_1.GameStatus.OPEN, game_types_1.GameStatus.FULL] } }
});
gameSchema.virtual('creator', {
    ref: 'User',
    localField: 'creatorId',
    foreignField: '_id',
    justOne: true
});
gameSchema.pre('save', async function () {
    const doc = this;
    if (doc.currentPlayers > doc.maxPlayers) {
        throw new Error('Current players cannot exceed max players');
    }
    if (this.isNew && doc.endTime <= new Date()) {
        throw new Error('End time must be in the future');
    }
    if (doc.currentPlayers >= doc.maxPlayers && doc.status === game_types_1.GameStatus.OPEN) {
        doc.status = game_types_1.GameStatus.FULL;
    }
    else if (doc.currentPlayers < doc.maxPlayers && doc.status === game_types_1.GameStatus.FULL) {
        doc.status = game_types_1.GameStatus.OPEN;
    }
});
const Game = mongoose_1.default.model('Game', gameSchema);
exports.default = Game;
//# sourceMappingURL=game.model.js.map