/**
 * TokenRevocationStore — maintains a list of revoked JWT IDs (jti).
 * On logout or security events, tokens are added here and checked on each request.
 * Uses in-memory store with TTL; swap for Redis for multi-instance deployments.
 */

interface RevokedEntry {
  revokedAt: number;
  expiresAt: number;
  reason: 'logout' | 'password_change' | 'admin' | 'suspicious';
}

const store = new Map<string, RevokedEntry>();
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000;

// Periodic cleanup of expired revocations
setInterval(() => {
  const now = Date.now();
  for (const [jti, entry] of store.entries()) {
    if (now > entry.expiresAt) {
      store.delete(jti);
    }
  }
}, CLEANUP_INTERVAL_MS);

export class TokenRevocationStore {
  static revoke(
    jti: string,
    expiresAt: number,
    reason: RevokedEntry['reason'] = 'logout'
  ): void {
    store.set(jti, { revokedAt: Date.now(), expiresAt, reason });
  }

  static isRevoked(jti: string): boolean {
    const entry = store.get(jti);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      store.delete(jti);
      return false;
    }
    return true;
  }

  static revokeAllForUser(userJtis: string[], expiresAt: number): void {
    for (const jti of userJtis) {
      TokenRevocationStore.revoke(jti, expiresAt, 'password_change');
    }
  }

  static getStats(): { total: number; byReason: Record<string, number> } {
    const byReason: Record<string, number> = {};
    for (const entry of store.values()) {
      byReason[entry.reason] = (byReason[entry.reason] ?? 0) + 1;
    }
    return { total: store.size, byReason };
  }
}
