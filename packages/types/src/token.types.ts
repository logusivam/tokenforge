export interface JwtPayload {
  sub: string              // userId (MongoDB ObjectId as string)
  jti: string              // Unique token ID — used for blacklisting
  role: UserRole           // Single primary role
  permissions: PermissionString[]  // Flattened permission strings for fast lookup
  iat: number              // Issued at (Unix timestamp)
  exp: number              // Expires at (Unix timestamp)
}

export interface RefreshTokenMeta {
  userId: string
  familyId: string         // Token family — all tokens from one login session
}

export type UserRole = 'admin' | 'moderator' | 'user' | 'guest'

// Pattern: resource:action or resource:action:scope
export type PermissionString =
  | 'users:read'
  | 'users:write'
  | 'users:delete'
  | 'profile:read:own'
  | 'profile:write:own'
  | 'profile:delete:own'
  | 'audit:read'
  | 'roles:read'
  | 'roles:write'
  | 'sessions:delete'