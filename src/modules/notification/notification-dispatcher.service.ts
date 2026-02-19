import { NotificationBuilder } from './notification-builder.service';
import { DeviceTokenRepository } from './device-token.repository';
import { pushAdapter } from './push-notification.adapter';
import mongoose, { Types } from 'mongoose';

export interface SendNotificationOptions {
  userIds: string[];
  templateKey?: string;
  templateVars?: Record<string, string>;
  title?: string;
  body?: string;
  deepLink?: string;
  data?: Record<string, string>;
  saveToDb?: boolean;
}

export class NotificationDispatcher {
  private get notifModel() {
    return mongoose.model('Notification');
  }

  async dispatch(options: SendNotificationOptions): Promise<{ sent: number; failed: number }> {
    const { userIds, templateKey, templateVars, title, body, deepLink, data, saveToDb = true } = options;

    let payload = title && body ? { title, body, deepLink, data } : null;

    if (templateKey && !payload) {
      payload = await NotificationBuilder.build(templateKey, templateVars ?? {}, { deepLink, data });
    }

    if (!payload) return { sent: 0, failed: userIds.length };

    let totalSent = 0;
    let totalFailed = 0;

    for (const userId of userIds) {
      const tokens = await DeviceTokenRepository.getActiveTokens(userId);

      if (tokens.length > 0) {
        const result = await pushAdapter.sendToMultiple({ tokens, ...payload });
        totalSent += result.sent;
        totalFailed += result.failed;
      }

      if (saveToDb) {
        await this.notifModel.create({
          userId: new Types.ObjectId(userId),
          title: payload.title,
          message: payload.body,
          type: templateKey ?? 'custom',
          data: { ...(payload.data ?? {}), deepLink: payload.deepLink },
          isRead: false,
        }).catch(() => { /* non-critical */ });
      }
    }

    return { sent: totalSent, failed: totalFailed };
  }
}

export const notificationDispatcher = new NotificationDispatcher();
