// Token configuration
export const TOKEN_CONFIG = {
  ACCESS_EXPIRY_SECONDS: 15 * 60,         // 15 minutes
  REFRESH_EXPIRY_SECONDS: 7 * 24 * 60 * 60, // 7 days
  OAUTH_STATE_EXPIRY_SECONDS: 10 * 60,    // 10 minutes
  AT_BLACKLIST_EXPIRY_SECONDS: 15 * 60,   // Must match ACCESS_EXPIRY
} as const

// Cookie options — consistent across all cookie writes
export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/api/v1/auth',                   // Scoped — not sent to all routes
  maxAge: TOKEN_CONFIG.REFRESH_EXPIRY_SECONDS * 1000, // milliseconds
} as const

// Redis key prefixes — centralised to avoid typos across services
export const REDIS_KEYS = {
  refreshToken: (token: string) => `refresh:${token}`,
  tokenFamily: (familyId: string) => `family:${familyId}`,
  atBlacklist: (jti: string) => `at:blacklist:${jti}`,
  oauthState: (state: string) => `oauth:state:${state}`,
  rateLimitLogin: (ip: string) => `ratelimit:login:${ip}`,
} as const

// Audit event enum — single source of truth for event names
export enum AuditEvent {
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  LOGOUT_ALL = 'LOGOUT_ALL',
  TOKEN_REFRESH = 'TOKEN_REFRESH',
  REFRESH_REUSE_ATTACK = 'REFRESH_REUSE_ATTACK',
  OAUTH_LOGIN = 'OAUTH_LOGIN',
  OAUTH_LINK = 'OAUTH_LINK',
  ROLE_CHANGED = 'ROLE_CHANGED',
  SESSION_REVOKED = 'SESSION_REVOKED',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  ACCOUNT_DELETED = 'ACCOUNT_DELETED',
}

// Rate limiter config
export const RATE_LIMIT = {
  LOGIN_MAX: 5,
  LOGIN_WINDOW_MS: 15 * 60 * 1000,       // 15 minutes
  REGISTER_MAX: 3,
  REGISTER_WINDOW_MS: 60 * 60 * 1000,    // 1 hour per IP
  API_GENERAL_MAX: 100,
  API_GENERAL_WINDOW_MS: 60 * 1000,      // 100 req/min for general API
} as const