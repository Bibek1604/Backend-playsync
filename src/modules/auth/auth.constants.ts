/** Central security configuration for auth module */

export const AUTH_SECURITY = {
  // JWT
  ACCESS_TOKEN_TTL: '15m',
  REFRESH_TOKEN_TTL: '7d',
  JWT_ALGORITHM: 'HS256',

  // Passwords
  BCRYPT_ROUNDS: 12,
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  PASSWORD_STRENGTH_RULES: {
    requireUppercase: true,
    requireLowercase: true,
    requireDigit: true,
    requireSpecialChar: false,
  },

  // Account lockout
  MAX_LOGIN_ATTEMPTS: 5,
  LOGIN_WINDOW_MS: 15 * 60 * 1000,     // 15 min
  LOCKOUT_DURATION_MS: 30 * 60 * 1000, // 30 min

  // Rate limiting (auth endpoints)
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 min
  RATE_LIMIT_MAX_REQUESTS: 10,

  // Audit
  AUDIT_LOG_TTL_DAYS: 90,

  // Cookies
  REFRESH_TOKEN_COOKIE: 'refresh_token',
  CSRF_COOKIE: 'csrf_token',
  COOKIE_HTTP_ONLY: true,
  COOKIE_SAME_SITE: 'strict' as const,
} as const;

export const AUTH_ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password.',
  ACCOUNT_LOCKED: 'Account is temporarily locked due to too many failed attempts.',
  EMAIL_NOT_VERIFIED: 'Please verify your email address before logging in.',
  TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
  TOKEN_REVOKED: 'This session has been invalidated. Please log in again.',
  RATE_LIMITED: 'Too many requests. Please try again later.',
  CSRF_INVALID: 'Security token is missing or invalid.',
  UNAUTHORIZED: 'You must be logged in to access this resource.',
  FORBIDDEN: 'You do not have permission to perform this action.',
} as const;
