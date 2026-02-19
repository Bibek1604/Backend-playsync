import { Router } from 'express';
import { NotificationController } from './notification.controller';
import { NotificationPushController } from './notification-push.controller';
import { NotificationAdminController } from './notification-admin.controller';

const router = Router();

// Device token management
router.post('/device-token', NotificationPushController.registerToken);
router.delete('/device-token', NotificationPushController.deregisterToken);

// Existing notification CRUD (merged from existing routes)
router.get('/', NotificationController.getNotifications);
router.get('/unread-count', NotificationController.getUnreadCount);
router.put('/:id/read', NotificationController.markAsRead);
router.put('/read-all', NotificationController.markAllAsRead);
router.delete('/:id', NotificationController.deleteNotification);

// Admin
router.post('/admin/broadcast', NotificationAdminController.broadcast);
router.get('/admin/stats', NotificationAdminController.stats);
router.post('/admin/test-push', NotificationPushController.testPush);

export default router;
