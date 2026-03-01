import { Request, Response, NextFunction } from 'express';

type Role = 'user' | 'admin' | 'moderator' | 'superadmin';

const ROLE_HIERARCHY: Record<Role, number> = {
  user: 0,
  moderator: 1,
  admin: 2,
  superadmin: 3,
};

/**
 * requireRole — ensures the authenticated user has at least the minimum role level.
 */
export function requireRole(minimumRole: Role) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const userLevel = ROLE_HIERARCHY[user.role as Role] ?? -1;
    const required = ROLE_HIERARCHY[minimumRole];

    if (userLevel < required) {
      res.status(403).json({
        success: false,
        message: `Requires ${minimumRole} role or higher.`,
      });
      return;
    }

    next();
  };
}

/**
 * requireOwnership — ensures the authenticated user owns the requested resource.
 * Admins bypass ownership checks.
 */
export function requireOwnership(userIdExtractor: (req: Request) => string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const ownerId = userIdExtractor(req);
    const isOwner = user.id === ownerId;
    const isAdmin = ROLE_HIERARCHY[user.role as Role] >= ROLE_HIERARCHY['admin'];

    if (!isOwner && !isAdmin) {
      res.status(403).json({ success: false, message: 'You do not have permission to access this resource.' });
      return;
    }

    next();
  };
}
