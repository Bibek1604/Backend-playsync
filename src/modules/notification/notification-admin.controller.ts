import { Request, Response } from 'express';
import { notificationDispatcher } from './notification-dispatcher.service';
import mongoose from 'mongoose';

export class NotificationAdminController {
  /**
   * POST /admin/notifications/broadcast
   * Send a notification to all or selected users.
   */
  static async broadcast(req: Request, res: Response): Promise<void> {
    try {
      const { userIds, title, body, templateKey, templateVars, deepLink } = req.body;

      let recipients: string[] = userIds;
      if (!recipients || recipients.length === 0) {
        // Fetch all active users
        const userModel = mongoose.model('User');
        const users = await userModel.find({ isActive: true }).select('_id').lean();
        recipients = users.map((u: any) => u._id.toString());
      }

      const result = await notificationDispatcher.dispatch({
        userIds: recipients,
        title,
        body,
        templateKey,
        templateVars,
        deepLink,
        saveToDb: true,
      });

      res.status(200).json({ success: true, data: { ...result, total: recipients.length } });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * GET /admin/notifications/stats
   */
  static async stats(req: Request, res: Response): Promise<void> {
    try {
      const notifModel = mongoose.model('Notification');
      const [total, unread, byType] = await Promise.all([
        notifModel.countDocuments(),
        notifModel.countDocuments({ isRead: false }),
        notifModel.aggregate([
          { $group: { _id: '$type', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
      ]);
      res.status(200).json({ success: true, data: { total, unread, byType } });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}
