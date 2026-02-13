/**
 * Game Tags - Service Layer
 * Business logic for game tags operations
 */

import Game from '../game.model';

export interface IPopularTag {
  tag: string;
  count: number;
}

export class TagsService {
  /**
   * Get most popular tags by usage count
   */
  async getPopularTags(limit: number = 20): Promise<IPopularTag[]> {
    const result = await Game.aggregate([
      // Unwind tags array to individual documents
      { $unwind: '$tags' },
      
      // Group by tag and count occurrences
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 }
        }
      },
      
      // Sort by count descending
      { $sort: { count: -1 } },
      
      // Limit results
      { $limit: limit },
      
      // Project to cleaner format
      {
        $project: {
          _id: 0,
          tag: '$_id',
          count: 1
        }
      }
    ]);

    return result;
  }

  /**
   * Get tags used in active games (OPEN or FULL status)
   */
  async getActiveTags(limit: number = 20): Promise<IPopularTag[]> {
    const result = await Game.aggregate([
      // Filter only active games
      {
        $match: {
          status: { $in: ['OPEN', 'FULL'] }
        }
      },
      
      // Unwind tags array
      { $unwind: '$tags' },
      
      // Group by tag and count
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 }
        }
      },
      
      // Sort by count descending
      { $sort: { count: -1 } },
      
      // Limit results
      { $limit: limit },
      
      // Project to cleaner format
      {
        $project: {
          _id: 0,
          tag: '$_id',
          count: 1
        }
      }
    ]);

    return result;
  }
}
