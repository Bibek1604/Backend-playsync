/**
 * Game Cleanup Job
 * Cron job to automatically end expired games
 * Runs every 5 minutes to check for games past their endTime
 */

import cron from 'node-cron';
import { GameService } from '../modules/game/game.service';
import logger from '../Share/utils/logger';

class GameCleanupJob {
  private gameService: GameService;
  private isRunning: boolean = false;

  constructor() {
    this.gameService = new GameService();
  }

  /**
   * Start the cleanup job
   */
  start(): void {
    // Run every 5 minutes: */5 * * * *
    // For testing, you can use '* * * * *' to run every minute
    const cronExpression = process.env.GAME_CLEANUP_CRON || '*/5 * * * *';

    cron.schedule(cronExpression, async () => {
      if (this.isRunning) {
        logger.warn('Game cleanup job is already running, skipping this iteration');
        return;
      }

      await this.runCleanup();
    });

    logger.info(`✅ Game cleanup job started (cron: ${cronExpression})`);
  }

  /**
   * Run the cleanup task
   */
  private async runCleanup(): Promise<void> {
    this.isRunning = true;
    const startTime = Date.now();

    try {
      logger.info('🧹 Starting game cleanup job...');

      const endedCount = await this.gameService.endExpiredGames();

      const executionTime = Date.now() - startTime;

      if (endedCount > 0) {
        logger.info(
          `✅ Game cleanup completed: ${endedCount} game(s) ended in ${executionTime}ms`
        );
      } else {
        logger.info(`✅ Game cleanup completed: No expired games found (${executionTime}ms)`);
      }
    } catch (error: any) {
      logger.error({
        err: error,
        message: '❌ Game cleanup job failed'
      });
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Manual trigger for cleanup (useful for testing or manual operations)
   */
  async runManual(): Promise<number> {
    logger.info('🧹 Manual game cleanup triggered...');
    const endedCount = await this.gameService.endExpiredGames();
    logger.info(`✅ Manual cleanup completed: ${endedCount} game(s) ended`);
    return endedCount;
  }
}

// Export singleton instance
const gameCleanupJob = new GameCleanupJob();
export default gameCleanupJob;
