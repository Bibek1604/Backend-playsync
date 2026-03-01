import { Router } from 'express';
import adminController from './admin.controller';
import { auth } from '../auth/auth.middleware';
import { authorize } from '../auth/auth.middleware';
import { validateDto } from '../../Share/utils/validateDto';
import {
  getUsersQuerySchema,
  getGamesQuerySchema,
  userIdParamSchema,
  gameIdParamSchema,
} from './admin.dto';

const router = Router();

// All admin routes require authentication + admin role
router.use(auth, authorize('admin'));

/**
 * User Management Routes
 */
router.get('/users', validateDto(getUsersQuerySchema), adminController.getUsers);
router.get('/users/:userId', validateDto(userIdParamSchema), adminController.getUserById);

/**
 * Game Management Routes
 */
router.get('/games', validateDto(getGamesQuerySchema), adminController.getGames);
router.get('/games/online', validateDto(getGamesQuerySchema), adminController.getOnlineGames);
router.get('/games/offline', validateDto(getGamesQuerySchema), adminController.getOfflineGames);
router.get('/games/:gameId', validateDto(gameIdParamSchema), adminController.getGameById);

/**
 * Statistics Routes
 */
router.get('/stats', adminController.getStats);

export default router;
