/**
 * XP Increment Job
 * Cron job to automatically award XP to active players every 2 minutes
 */

import cron from 'node-cron';
import logger from '../Share/utils/logger';
import Game from '../modules/game/game.model';
import { GameStatus } from '../modules/game/game.types';
import { UserService } from '../modules/user/user.service';

class XPJob {
    private userService: UserService;
    private isRunning: boolean = false;

    constructor() {
        this.userService = new UserService();
    }

    /**
     * Start the XP job
     */
    start(): void {
        // Run every 2 minutes
        const cronExpression = process.env.XP_CRON || '*/2 * * * *';

        cron.schedule(cronExpression, async () => {
            if (this.isRunning) {
                logger.warn('XP job is already running, skipping this iteration');
                return;
            }

            await this.runXPJob();
        });

        logger.info(`✅ XP job started (cron: ${cronExpression})`);
    }

    /**
     * Run the task
     */
    private async runXPJob(): Promise<void> {
        this.isRunning = true;
        const startTime = Date.now();

        try {
            // Find all games that are currently OPEN or FULL
            const games = await Game.find({
                status: { $in: [GameStatus.OPEN, GameStatus.FULL] }
            });

            const userIdsToAward = new Set<string>();

            games.forEach(game => {
                // Only award XP if the game has started (startTime <= now)
                if (game.startTime.getTime() <= startTime) {
                    game.participants.forEach(p => {
                        if (p.status === 'ACTIVE') {
                            userIdsToAward.add(p.userId.toString());
                        }
                    });
                }
            });

            const userArray = Array.from(userIdsToAward);

            if (userArray.length > 0) {
                await this.userService.awardPlayTimeXP(userArray);
                logger.info(`✅ Awarded 2 XP to ${userArray.length} active players`);
            }

        } catch (error: any) {
            logger.error({
                err: error,
                message: '❌ XP job failed'
            });
        } finally {
            this.isRunning = false;
        }
    }
}

// Export singleton instance
const xpJob = new XPJob();
export default xpJob;
