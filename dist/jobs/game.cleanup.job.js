"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const game_service_1 = require("../modules/game/game.service");
const logger_1 = __importDefault(require("../Share/utils/logger"));
class GameCleanupJob {
    constructor() {
        this.isRunning = false;
        this.gameService = new game_service_1.GameService();
    }
    start() {
        const cronExpression = process.env.GAME_CLEANUP_CRON || '*/5 * * * *';
        node_cron_1.default.schedule(cronExpression, async () => {
            if (this.isRunning) {
                logger_1.default.warn('Game cleanup job is already running, skipping this iteration');
                return;
            }
            await this.runCleanup();
        });
        logger_1.default.info(`✅ Game cleanup job started (cron: ${cronExpression})`);
    }
    async runCleanup() {
        this.isRunning = true;
        const startTime = Date.now();
        try {
            logger_1.default.info('🧹 Starting game cleanup job...');
            const endedCount = await this.gameService.endExpiredGames();
            const executionTime = Date.now() - startTime;
            if (endedCount > 0) {
                logger_1.default.info(`✅ Game cleanup completed: ${endedCount} game(s) ended in ${executionTime}ms`);
            }
            else {
                logger_1.default.info(`✅ Game cleanup completed: No expired games found (${executionTime}ms)`);
            }
        }
        catch (error) {
            logger_1.default.error({
                err: error,
                message: '❌ Game cleanup job failed'
            });
        }
        finally {
            this.isRunning = false;
        }
    }
    async runManual() {
        logger_1.default.info('🧹 Manual game cleanup triggered...');
        const endedCount = await this.gameService.endExpiredGames();
        logger_1.default.info(`✅ Manual cleanup completed: ${endedCount} game(s) ended`);
        return endedCount;
    }
}
const gameCleanupJob = new GameCleanupJob();
exports.default = gameCleanupJob;
//# sourceMappingURL=game.cleanup.job.js.map