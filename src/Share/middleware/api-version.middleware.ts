import { Request, Response, NextFunction } from 'express';

type ApiVersion = 'v1' | 'v2';

const currentVersion: ApiVersion = 'v1';
const deprecatedVersions: ApiVersion[] = [];
const sunsetDates: Partial<Record<ApiVersion, string>> = {};

/**
 * apiVersionGuard — validates the API version from request headers or URL prefix.
 * Sets deprecation warnings headers when applicable.
 */
export function apiVersionGuard(req: Request, res: Response, next: NextFunction): void {
  const versionFromHeader = req.headers['x-api-version'] as string | undefined;
  const versionFromUrl = req.path.match(/\/v(\d+)\//)?.[1];
  const requested = (versionFromHeader ?? (versionFromUrl ? `v${versionFromUrl}` : currentVersion)) as ApiVersion;

  if (deprecatedVersions.includes(requested)) {
    res.setHeader('Deprecation', 'true');
    res.setHeader('X-API-Version', requested);
    if (sunsetDates[requested]) {
      res.setHeader('Sunset', sunsetDates[requested]!);
    }
  }

  (req as any).apiVersion = requested;
  next();
}

/**
 * paginationDefaults — normalises page/limit query params.
 */
export function paginationDefaults(defaultLimit = 20, maxLimit = 100) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const rawLimit = Number(req.query['limit'] ?? defaultLimit);
    const rawPage = Number(req.query['page'] ?? 1);

    req.query['limit'] = String(Math.min(rawLimit > 0 ? rawLimit : defaultLimit, maxLimit));
    req.query['page'] = String(rawPage > 0 ? rawPage : 1);
    next();
  };
}
