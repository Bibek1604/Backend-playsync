import { EventEmitter } from 'events';
import { AuditLog, AuditAction } from './audit-log.model';

interface AuthEventPayload {
  userId?: string;
  action: AuditAction;
  ipAddress: string;
  userAgent?: string;
  success: boolean;
  meta?: Record<string, unknown>;
}

class AuthEventEmitter extends EventEmitter {
  emit(event: 'auth', payload: AuthEventPayload): boolean;
  emit(event: string, ...args: any[]): boolean {
    return super.emit(event, ...args);
  }

  on(event: 'auth', listener: (payload: AuthEventPayload) => void): this;
  on(event: string, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }
}

export const authEvents = new AuthEventEmitter();

// Automatically persist auth events to AuditLog
authEvents.on('auth', async (payload: AuthEventPayload) => {
  try {
    await AuditLog.create({
      userId: payload.userId ?? undefined,
      action: payload.action,
      ipAddress: payload.ipAddress,
      userAgent: payload.userAgent ?? 'unknown',
      success: payload.success,
      meta: payload.meta,
    });
  } catch {
    // Non-critical: do not crash the request on audit failure
  }
});

export function emitAuthEvent(payload: AuthEventPayload): void {
  authEvents.emit('auth', payload);
}
