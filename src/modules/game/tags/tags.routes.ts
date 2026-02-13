/**
 * Game Tags - Routes
 * API route definitions for game tags operations
 */

import { Router } from 'express';
import { TagsController } from './tags.controller';
import { asyncHandler } from '../../../Share/utils/asyncHandler';

const router = Router();
const controller = new TagsController();

/**
 * GET /api/v1/games/tags/popular
 * Get most popular game tags
 * Query params:
 *   - limit: number (default: 20, max: 100)
 */
router.get(
  '/popular',
  asyncHandler(controller.getPopularTags.bind(controller))
);

export default router;
