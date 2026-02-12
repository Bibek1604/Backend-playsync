/**
 * OPTIONAL: Redis Caching for Leaderboard
 * Improves performance by caching leaderboard data
 * 
 * Installation:
 * npm install redis
 * npm install -D @types/redis
 */

import { createClient, RedisClientType } from 'redis';
import { LeaderboardResponse } from '../../modules/scorecard/scorecard.types';

class LeaderboardCache {
  private client: RedisClientType | null = null;
  private readonly TTL = 300; // 5 minutes in seconds

  async connect(): Promise<void> {
    try {
      this.client = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
      });

      this.client.on('error', (err) => {
        console.error('Redis Client Error:', err);
      });

      await this.client.connect();
      console.log('✅ Redis connected for leaderboard caching');
    } catch (error) {
      console.warn('⚠️ Redis not available, caching disabled:', error);
      this.client = null;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
    }
  }

  /**
   * Generate cache key based on query parameters
   */
  private getCacheKey(page: number, limit: number, period: string): string {
    return `leaderboard:${period}:p${page}:l${limit}`;
  }

  /**
   * Get cached leaderboard data
   */
  async get(
    page: number,
    limit: number,
    period: string
  ): Promise<LeaderboardResponse | null> {
    if (!this.client) return null;

    try {
      const key = this.getCacheKey(page, limit, period);
      const cached = await this.client.get(key);
      
      if (cached) {
        console.log(`📦 Cache HIT for ${key}`);
        return JSON.parse(cached);
      }
      
      console.log(`📭 Cache MISS for ${key}`);
      return null;
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  }

  /**
   * Cache leaderboard data
   */
  async set(
    page: number,
    limit: number,
    period: string,
    data: LeaderboardResponse
  ): Promise<void> {
    if (!this.client) return;

    try {
      const key = this.getCacheKey(page, limit, period);
      await this.client.setEx(key, this.TTL, JSON.stringify(data));
      console.log(`💾 Cached ${key} for ${this.TTL}s`);
    } catch (error) {
      console.error('Redis SET error:', error);
    }
  }

  /**
   * Invalidate all leaderboard cache
   * Call this when game participation changes
   */
  async invalidate(): Promise<void> {
    if (!this.client) return;

    try {
      const keys = await this.client.keys('leaderboard:*');
      if (keys.length > 0) {
        await this.client.del(keys);
        console.log(`🗑️ Invalidated ${keys.length} leaderboard cache entries`);
      }
    } catch (error) {
      console.error('Redis INVALIDATE error:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{ keys: number; memory: string }> {
    if (!this.client) {
      return { keys: 0, memory: '0B' };
    }

    try {
      const keys = await this.client.keys('leaderboard:*');
      const info = await this.client.info('memory');
      const memoryMatch = info.match(/used_memory_human:(.+)/);
      const memory = memoryMatch ? memoryMatch[1].trim() : '0B';

      return {
        keys: keys.length,
        memory,
      };
    } catch (error) {
      console.error('Redis STATS error:', error);
      return { keys: 0, memory: '0B' };
    }
  }
}

// Singleton instance
export const leaderboardCache = new LeaderboardCache();

/**
 * USAGE IN SERVICE LAYER:
 * 
 * import { leaderboardCache } from '../../../Share/cache/leaderboard.cache';
 * 
 * // In getLeaderboard method:
 * async getLeaderboard(queryParams: GetLeaderboardQuery): Promise<LeaderboardResponse> {
 *   const { limit = 50, page = 1, period = 'all' } = queryParams;
 * 
 *   // Try cache first
 *   const cached = await leaderboardCache.get(page, limit, period);
 *   if (cached) {
 *     return cached;
 *   }
 * 
 *   // Query database
 *   const result = await this.scorecardRepository.getLeaderboard(...);
 * 
 *   // Cache the result
 *   await leaderboardCache.set(page, limit, period, result);
 * 
 *   return result;
 * }
 * 
 * // In game join/leave operations, invalidate cache:
 * await leaderboardCache.invalidate();
 */

/**
 * ENVIRONMENT VARIABLES:
 * Add to .env:
 * REDIS_URL=redis://localhost:6379
 * 
 * For production:
 * REDIS_URL=redis://username:password@host:port
 */

/**
 * DOCKER SETUP:
 * docker run -d --name redis -p 6379:6379 redis:alpine
 */
