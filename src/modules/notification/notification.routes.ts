/**
 * Notification Module - Routes
 */

import { Router } from 'express';
import { NotificationController } from './notification.controller';
import { auth } from '../auth/auth.middleware';
import { validateDto } from '../../Share/utils/validateDto';
import { getNotificationsSchema, markNotificationReadSchema } from './notification.dto';

const router = Router();
const controller = new NotificationController();

// All notification routes require authentication
router.use(auth);

/**
 * GET /api/v1/notifications
 * Get user notifications with pagination and filters
 */
router.get(
  '/',
  validateDto(getNotificationsSchema),
  controller.getNotifications.bind(controller)
);

/**
 * GET /api/v1/notifications/unread-count
 * Get unread notification count
 */
router.get(
  '/unread-count',
  controller.getUnreadCount.bind(controller)
);

/**
 * PATCH /api/v1/notifications/read-all
 * Mark all notifications as read
 */
router.patch(
  '/read-all',
  controller.markAllAsRead.bind(controller)
);

/**
 * PATCH /api/v1/notifications/:id/read
 * Mark a specific notification as read
 */
router.patch(
  '/:id/read',
  validateDto(markNotificationReadSchema),
  controller.markAsRead.bind(controller)
);

export default router;
