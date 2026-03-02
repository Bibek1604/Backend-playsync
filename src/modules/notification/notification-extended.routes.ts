import { Router } from 'express';
import { NotificationController } from './notification.controller';
import { NotificationController as NotificationPushController } from './notification-push.controller';
import { NotificationAdminController } from './notification-admin.controller';
import { auth } from '../auth/auth.middleware';

const router = Router();
const notificationCtrl = new NotificationController();

// Device token management
router.post('/device-token', auth, NotificationPushController.registerToken);
router.delete('/device-token', auth, NotificationPushController.deregisterToken);

// Existing notification CRUD (merged from existing routes)
router.get('/', auth, notificationCtrl.getNotifications.bind(notificationCtrl));
router.get('/unread-count', auth, notificationCtrl.getUnreadCount.bind(notificationCtrl));
router.put('/:id/read', auth, notificationCtrl.markAsRead.bind(notificationCtrl));
router.put('/read-all', auth, notificationCtrl.markAllAsRead.bind(notificationCtrl));

// Admin
router.post('/admin/broadcast', auth, NotificationAdminController.broadcast);
router.get('/admin/stats', auth, NotificationAdminController.stats);
router.post('/admin/test-push', auth, NotificationPushController.testPush);

export default router;
