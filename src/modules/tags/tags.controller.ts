/**
 * Game Tags - Controller Layer
 * HTTP request handling for game tags operations
 */

import { Request, Response } from 'express';
import { TagsService } from './tags.service';
import { apiResponse } from '../../Share/utils/apiResponse';

export class TagsController {
  private service: TagsService;

  constructor() {
    this.service = new TagsService();
  }

  /**
   * @swagger
   * /api/v1/games/tags/popular:
   *   get:
   *     tags:
   *       - Games
   *     summary: Get popular game tags
   *     description: Retrieve the most popular game tags based on usage count across all games
   *     parameters:
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 20
   *         description: Maximum number of tags to return
   *         example: 20
   *     responses:
   *       200:
   *         description: Popular tags retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Popular tags retrieved successfully"
   *                 data:
   *                   type: object
   *                   properties:
   *                     tags:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           tag:
   *                             type: string
   *                             example: "valorant"
   *                           count:
   *                             type: integer
   *                             example: 42
   *                       example:
   *                         - tag: "valorant"
   *                           count: 42
   *                         - tag: "pubg"
   *                           count: 38
   *                         - tag: "ranked"
   *                           count: 35
   *       400:
   *         description: Invalid query parameters
   */
  async getPopularTags(req: Request, res: Response): Promise<void> {
    const limit = parseInt(req.query.limit as string) || 20;
    
    const tags = await this.service.getPopularTags(limit);

    res.status(200).json(
      apiResponse(
        true,
        'Popular tags retrieved successfully',
        { tags }
      )
    );
  }
}
