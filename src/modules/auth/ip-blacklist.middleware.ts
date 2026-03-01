import { Request, Response, NextFunction } from 'express';

const blacklist = new Set<string>([
  // Seed with known bad actors if needed
]);

const autoBlocked = new Map<string, { reason: string; blockedAt: number }>();
const AUTO_BLOCK_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export class IpBlacklist {
  static add(ip: string, reason = 'manual'): void {
    autoBlocked.set(ip, { reason, blockedAt: Date.now() });
  }

  static remove(ip: string): void {
    blacklist.delete(ip);
    autoBlocked.delete(ip);
  }

  static isBlocked(ip: string): boolean {
    if (blacklist.has(ip)) return true;
    const entry = autoBlocked.get(ip);
    if (!entry) return false;
    if (Date.now() - entry.blockedAt > AUTO_BLOCK_DURATION_MS) {
      autoBlocked.delete(ip);
      return false;
    }
    return true;
  }

  static list(): Array<{ ip: string; source: 'static' | 'auto'; reason?: string }> {
    const result: Array<{ ip: string; source: 'static' | 'auto'; reason?: string }> = [];
    for (const ip of blacklist) result.push({ ip, source: 'static' });
    for (const [ip, entry] of autoBlocked) result.push({ ip, source: 'auto', reason: entry.reason });
    return result;
  }
}

export function ipBlacklistGuard(req: Request, res: Response, next: NextFunction): void {
  const ip = req.ip ?? '';
  if (IpBlacklist.isBlocked(ip)) {
    res.status(403).json({ success: false, message: 'Access denied.' });
    return;
  }
  next();
}
