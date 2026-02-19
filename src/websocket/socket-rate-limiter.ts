import { Socket } from 'socket.io';

interface RateLimitRecord {
  count: number;
  windowStart: number;
}

const records = new Map<string, RateLimitRecord>();

export interface SocketRateLimitOptions {
  maxEvents: number;
  windowMs: number;
}

const DEFAULT_OPTIONS: SocketRateLimitOptions = {
  maxEvents: 30,
  windowMs: 10 * 1000, // 10 seconds
};

/**
 * Factory: returns a socket middleware that rate-limits events.
 * Call once per socket during the 'connection' handler.
 */
export function createSocketRateLimiter(options = DEFAULT_OPTIONS) {
  return (event: string[], next: (err?: Error) => void): void => {
    // event[0] is the event name, this is Socket.IO v4 onAny middleware style
    const key = (event as any)?.__socketId ?? 'global';
    const now = Date.now();
    let record = records.get(key);

    if (!record || now - record.windowStart > options.windowMs) {
      record = { count: 1, windowStart: now };
    } else {
      record.count += 1;
    }

    records.set(key, record);

    if (record.count > options.maxEvents) {
      next(new Error('Rate limit exceeded. Slow down.'));
      return;
    }
    next();
  };
}

/**
 * Attach rate limiter directly to a socket instance.
 */
export function attachSocketRateLimiter(socket: Socket, options = DEFAULT_OPTIONS): void {
  const windowMs = options.windowMs;
  const maxEvents = options.maxEvents;

  let count = 0;
  let windowStart = Date.now();

  socket.use((_event, next) => {
    const now = Date.now();
    if (now - windowStart > windowMs) {
      count = 0;
      windowStart = now;
    }
    count++;
    if (count > maxEvents) {
      next(new Error('Rate limit exceeded.'));
      return;
    }
    next();
  });
}
