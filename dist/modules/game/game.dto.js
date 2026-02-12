"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameIdParamSchema = exports.getGamesQuerySchema = exports.updateGameSchema = exports.createGameSchema = void 0;
const zod_1 = require("zod");
const game_types_1 = require("./game.types");
exports.createGameSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z
            .string()
            .min(3, 'Title must be at least 3 characters')
            .max(255, 'Title must not exceed 255 characters')
            .trim(),
        description: zod_1.z
            .string()
            .max(2000, 'Description must not exceed 2000 characters')
            .trim()
            .optional(),
        category: zod_1.z.nativeEnum(game_types_1.GameCategory, {
            message: 'Category must be either ONLINE or OFFLINE'
        }),
        maxPlayers: zod_1.z
            .number()
            .int('Max players must be an integer')
            .min(1, 'Max players must be at least 1')
            .max(1000, 'Max players cannot exceed 1000'),
        endTime: zod_1.z
            .string()
            .refine((val) => {
            const date = new Date(val);
            return !isNaN(date.getTime());
        }, 'Invalid date format')
            .refine((val) => {
            const date = new Date(val);
            const now = new Date();
            const minEndTime = new Date(now.getTime() + 5 * 60 * 1000);
            return date > minEndTime;
        }, 'End time must be at least 5 minutes from now')
            .refine((val) => {
            const date = new Date(val);
            const now = new Date();
            const maxEndTime = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
            return date < maxEndTime;
        }, 'End time cannot be more than 365 days from now')
            .transform((val) => new Date(val))
    })
}).passthrough();
exports.updateGameSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z
            .string()
            .min(3, 'Title must be at least 3 characters')
            .max(255, 'Title must not exceed 255 characters')
            .trim()
            .optional(),
        description: zod_1.z
            .string()
            .max(2000, 'Description must not exceed 2000 characters')
            .trim()
            .optional(),
        maxPlayers: zod_1.z
            .number()
            .int('Max players must be an integer')
            .min(1, 'Max players must be at least 1')
            .max(1000, 'Max players cannot exceed 1000')
            .optional(),
        endTime: zod_1.z
            .string()
            .refine((val) => {
            const date = new Date(val);
            return !isNaN(date.getTime());
        }, 'Invalid date format')
            .refine((val) => {
            const date = new Date(val);
            const now = new Date();
            return date > now;
        }, 'End time must be in the future')
            .transform((val) => new Date(val))
            .optional()
    })
}).passthrough();
exports.getGamesQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        category: zod_1.z.nativeEnum(game_types_1.GameCategory).optional(),
        status: zod_1.z.nativeEnum(game_types_1.GameStatus).optional(),
        creatorId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid creator ID format').optional(),
        search: zod_1.z.string().max(100).optional(),
        page: zod_1.z
            .string()
            .optional()
            .transform((val) => (val ? parseInt(val, 10) : 1))
            .refine((val) => val > 0, 'Page must be greater than 0'),
        limit: zod_1.z
            .string()
            .optional()
            .transform((val) => (val ? parseInt(val, 10) : 20))
            .refine((val) => val > 0 && val <= 100, 'Limit must be between 1 and 100')
    })
}).passthrough();
exports.gameIdParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid game ID format')
    })
}).passthrough();
//# sourceMappingURL=game.dto.js.map