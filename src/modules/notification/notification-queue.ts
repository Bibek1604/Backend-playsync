/**
 * NotificationQueue — in-memory queue for batching notifications before delivery.
 * Flushes every N ms or when size exceeds threshold.
 */

export interface QueuedNotification {
  userId: string;
  templateKey: string;
  variables?: Record<string, string>;
  channels?: Array<'push' | 'in_app' | 'email'>;
  scheduledAt?: Date;
  metadata?: Record<string, unknown>;
}

type FlushHandler = (items: QueuedNotification[]) => Promise<void>;

export class NotificationQueue {
  private queue: QueuedNotification[] = [];
  private flushHandler?: FlushHandler;
  private timer?: NodeJS.Timeout;

  constructor(
    private readonly flushIntervalMs = 500,
    private readonly maxSize = 50
  ) {}

  setFlushHandler(handler: FlushHandler): void {
    this.flushHandler = handler;
  }

  enqueue(notification: QueuedNotification): void {
    this.queue.push(notification);
    if (this.queue.length >= this.maxSize) {
      void this.flush();
      return;
    }
    if (!this.timer) {
      this.timer = setTimeout(() => void this.flush(), this.flushIntervalMs);
    }
  }

  async flush(): Promise<void> {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
    if (!this.queue.length || !this.flushHandler) return;
    const batch = this.queue.splice(0);
    await this.flushHandler(batch);
  }

  get size(): number { return this.queue.length; }
}

export const notificationQueue = new NotificationQueue();
