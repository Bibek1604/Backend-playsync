/**
 * AccountLockout — tracks failed login attempts per user ID and locks the account
 * after N consecutive failures. Uses an in-memory store; can be swapped for Redis.
 */

interface LockoutEntry {
  attempts: number;
  firstAttemptAt: number;
  lockedUntil?: number;
}

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;    // 15 min rolling window
const LOCKOUT_MS = 30 * 60 * 1000;   // 30 min lockout

const lockoutStore = new Map<string, LockoutEntry>();

export class AccountLockout {
  static recordFailure(userId: string): { locked: boolean; attemptsLeft: number } {
    const now = Date.now();
    let entry = lockoutStore.get(userId);

    if (!entry || now - entry.firstAttemptAt > WINDOW_MS) {
      entry = { attempts: 1, firstAttemptAt: now };
    } else {
      entry.attempts += 1;
    }

    if (entry.attempts >= MAX_ATTEMPTS) {
      entry.lockedUntil = now + LOCKOUT_MS;
      lockoutStore.set(userId, entry);
      return { locked: true, attemptsLeft: 0 };
    }

    lockoutStore.set(userId, entry);
    return { locked: false, attemptsLeft: MAX_ATTEMPTS - entry.attempts };
  }

  static isLocked(userId: string): { locked: boolean; unlocksAt?: Date } {
    const entry = lockoutStore.get(userId);
    if (!entry?.lockedUntil) return { locked: false };
    if (Date.now() >= entry.lockedUntil) {
      lockoutStore.delete(userId);
      return { locked: false };
    }
    return { locked: true, unlocksAt: new Date(entry.lockedUntil) };
  }

  static clearFailures(userId: string): void {
    lockoutStore.delete(userId);
  }

  static getRemainingLockout(userId: string): number {
    const entry = lockoutStore.get(userId);
    if (!entry?.lockedUntil) return 0;
    return Math.max(0, entry.lockedUntil - Date.now());
  }
}
