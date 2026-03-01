import { Request, Response } from 'express';
import { DeviceTokenRepository } from './device-token.repository';
import { notificationDispatcher } from './notification-dispatcher.service';

export class NotificationController {
  /**
   * POST /notifications/device-token
   * Register or refresh a push notification device token.
   */
  static async registerToken(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { token, platform, deviceId, appVersion } = req.body;

      if (!token || !platform) {
        res.status(400).json({ success: false, message: 'token and platform are required.' });
        return;
      }

      await DeviceTokenRepository.upsert(userId, token, platform, { deviceId, appVersion });
      res.status(200).json({ success: true, message: 'Device token registered.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * DELETE /notifications/device-token
   * Deactivate token on logout.
   */
  static async deregisterToken(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.body;
      if (!token) {
        res.status(400).json({ success: false, message: 'token is required.' });
        return;
      }
      await DeviceTokenRepository.deactivate(token);
      res.status(200).json({ success: true, message: 'Device token removed.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * POST /notifications/test-push (admin only)
   */
  static async testPush(req: Request, res: Response): Promise<void> {
    try {
      const { userId, title, body } = req.body;
      const result = await notificationDispatcher.dispatch({ userIds: [userId], title, body, saveToDb: false });
      res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}
