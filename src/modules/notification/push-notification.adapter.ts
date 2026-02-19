/**
 * PushNotificationAdapter — wraps FCM (Firebase Cloud Messaging) API calls.
 * Swap the implementation for Expo, APNs, or OneSignal as needed.
 */

export interface PushPayload {
  token: string;
  title: string;
  body: string;
  imageUrl?: string;
  data?: Record<string, string>;
}

export interface PushBatchPayload {
  tokens: string[];
  title: string;
  body: string;
  imageUrl?: string;
  data?: Record<string, string>;
}

export interface PushResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class PushNotificationAdapter {
  private apiKey = process.env.FCM_SERVER_KEY ?? '';
  private fcmUrl = 'https://fcm.googleapis.com/fcm/send';

  async sendToDevice(payload: PushPayload): Promise<PushResult> {
    if (!this.apiKey) return { success: false, error: 'FCM_SERVER_KEY not configured.' };
    try {
      const resp = await fetch(this.fcmUrl, {
        method: 'POST',
        headers: { Authorization: `key=${this.apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: payload.token,
          notification: { title: payload.title, body: payload.body, image: payload.imageUrl },
          data: payload.data,
        }),
      });
      const json = await resp.json();
      return { success: json.success === 1, messageId: json.results?.[0]?.message_id };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  async sendToMultiple(payload: PushBatchPayload): Promise<{ sent: number; failed: number }> {
    const results = await Promise.allSettled(
      payload.tokens.map((token) => this.sendToDevice({ ...payload, token }))
    );
    const sent = results.filter((r) => r.status === 'fulfilled' && r.value.success).length;
    return { sent, failed: payload.tokens.length - sent };
  }
}

export const pushAdapter = new PushNotificationAdapter();
